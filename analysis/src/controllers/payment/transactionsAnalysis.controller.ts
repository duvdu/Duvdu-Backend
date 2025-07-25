import {
  Transaction,
  FundedTransaction,
  TransactionStatus,
  TransactionType,
  FundedTransactionStatus,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

interface TransactionAnalysisQuery {
  interval?: 'today' | 'week' | 'month' | 'custom';
  from?: string;
  to?: string;
  currency?: string;
}

interface TransactionAnalysisResponse {
  summary: {
    totalRevenue: number;
    totalFundedRevenue: number;
    totalFundedFromFundedTransactions: number;
    totalPendingFunded: number;
    totalTransactions: number;
    totalFundedTransactions: number;
    averageTransactionValue: number;
    fundingRate: number; // percentage of funded transactions
  };
  revenueAnalysis: {
    deposits: {
      total: number;
      funded: number;
      pending: number;
      success: number;
      failed: number;
    };
    withdraws: {
      total: number;
      funded: number;
      pending: number;
      success: number;
      failed: number;
    };
  };
  fundedTransactionsAnalysis: {
    totalAmount: number;
    pendingAmount: number;
    successAmount: number;
    failedAmount: number;
    totalCount: number;
    pendingCount: number;
    successCount: number;
    failedCount: number;
  };
  timeSeriesData: {
    date: string;
    revenue: number;
    fundedRevenue: number;
    transactionCount: number;
    fundedCount: number;
  }[];
  topMetrics: {
    highestTransaction: number;
    lowestTransaction: number;
    mostCommonCurrency: string;
    averageFundingTime?: number; // in hours
  };
  growthMetrics: {
    revenueGrowth: number; // percentage
    transactionGrowth: number; // percentage
    fundingGrowth: number; // percentage
  };
  currencyBreakdown: {
    currency: string;
    totalRevenue: number;
    fundedRevenue: number;
    transactionCount: number;
  }[];
}

export const transactionsAnalysisController: RequestHandler<
  unknown,
  SuccessResponse<TransactionAnalysisResponse>,
  unknown,
  TransactionAnalysisQuery
> = async (req, res) => {
  try {
    const { interval = 'month', from, to, currency } = req.query;

    // Build date filter based on interval
    const dateFilter: any = {};
    const now = new Date();

    if (interval === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      dateFilter.$gte = startOfDay;
      dateFilter.$lte = endOfDay;
    } else if (interval === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter.$gte = startOfWeek;
    } else if (interval === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter.$gte = startOfMonth;
    } else if (interval === 'custom' && from && to) {
      dateFilter.$gte = new Date(from);
      dateFilter.$lte = new Date(to);
    }

    // Build main transaction filter for non-subscription transactions
    const transactionFilter: any = {
      isSubscription: false,
    };

    if (Object.keys(dateFilter).length > 0) {
      transactionFilter.timeStamp = dateFilter;
    }

    if (currency) {
      transactionFilter.currency = currency;
    }

    // Build funded transactions filter
    const fundedTransactionFilter: any = {};
    if (Object.keys(dateFilter).length > 0) {
      fundedTransactionFilter.createdAt = dateFilter;
    }

    // Get previous period for growth metrics
    const previousPeriodFilter = { ...transactionFilter };
    if (Object.keys(dateFilter).length > 0) {
      const periodLength = dateFilter.$lte
        ? new Date(dateFilter.$lte).getTime() - new Date(dateFilter.$gte).getTime()
        : 30 * 24 * 60 * 60 * 1000; // 30 days default

      const prevStart = new Date(new Date(dateFilter.$gte).getTime() - periodLength);
      const prevEnd = new Date(dateFilter.$gte);
      previousPeriodFilter.timeStamp = { $gte: prevStart, $lt: prevEnd };
    }

    // Execute all queries in parallel for better performance
    const [
      // Main transaction analysis
      transactionsSummary,
      depositAnalysis,
      withdrawAnalysis,

      // Funded transactions analysis
      fundedTransactionsSummary,

      // Time series data
      timeSeriesData,

      // Currency breakdown
      currencyData,

      // Top metrics
      topTransactions,
      currencyStats,

      // Previous period for growth
      previousPeriodStats,

      // Average funding time
      fundingTimeData,
    ] = await Promise.all([
      // Main transactions summary
      Transaction.aggregate([
        { $match: transactionFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalFundedRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', TransactionStatus.FUNDED] }, '$amount', 0],
              },
            },
            totalTransactions: { $sum: 1 },
            totalFundedTransactions: {
              $sum: {
                $cond: [{ $eq: ['$status', TransactionStatus.FUNDED] }, 1, 0],
              },
            },
            averageAmount: { $avg: '$amount' },
          },
        },
      ]),

      // Deposit analysis
      Transaction.aggregate([
        { $match: { ...transactionFilter, type: TransactionType.DEPOSIT } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Withdraw analysis
      Transaction.aggregate([
        { $match: { ...transactionFilter, type: TransactionType.WITHDRAW } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Funded transactions summary
      FundedTransaction.aggregate([
        { $match: fundedTransactionFilter },
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$fundAmount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Time series data
      Transaction.aggregate([
        { $match: transactionFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timeStamp' } },
            revenue: { $sum: '$amount' },
            fundedRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', TransactionStatus.FUNDED] }, '$amount', 0],
              },
            },
            transactionCount: { $sum: 1 },
            fundedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', TransactionStatus.FUNDED] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: '$_id',
            revenue: 1,
            fundedRevenue: 1,
            transactionCount: 1,
            fundedCount: 1,
            _id: 0,
          },
        },
      ]),

      // Currency breakdown
      Transaction.aggregate([
        { $match: transactionFilter },
        {
          $group: {
            _id: '$currency',
            totalRevenue: { $sum: '$amount' },
            fundedRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', TransactionStatus.FUNDED] }, '$amount', 0],
              },
            },
            transactionCount: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
        {
          $project: {
            currency: '$_id',
            totalRevenue: 1,
            fundedRevenue: 1,
            transactionCount: 1,
            _id: 0,
          },
        },
      ]),

      // Top transaction metrics
      Transaction.aggregate([
        { $match: transactionFilter },
        {
          $group: {
            _id: null,
            highest: { $max: '$amount' },
            lowest: { $min: '$amount' },
          },
        },
      ]),

      // Most common currency
      Transaction.aggregate([
        { $match: transactionFilter },
        {
          $group: {
            _id: '$currency',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),

      // Previous period stats for growth calculation
      Transaction.aggregate([
        { $match: previousPeriodFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            totalFunded: {
              $sum: {
                $cond: [{ $eq: ['$status', TransactionStatus.FUNDED] }, 1, 0],
              },
            },
          },
        },
      ]),

      // Average funding time calculation
      Transaction.aggregate([
        {
          $match: {
            ...transactionFilter,
            status: TransactionStatus.FUNDED,
            fundedAt: { $exists: true },
          },
        },
        {
          $project: {
            fundingTimeHours: {
              $divide: [
                { $subtract: ['$fundedAt', '$timeStamp'] },
                1000 * 60 * 60, // Convert milliseconds to hours
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageFundingTime: { $avg: '$fundingTimeHours' },
          },
        },
      ]),
    ]);

    // Process results
    const mainSummary = transactionsSummary[0] || {
      totalRevenue: 0,
      totalFundedRevenue: 0,
      totalTransactions: 0,
      totalFundedTransactions: 0,
      averageAmount: 0,
    };

    // Process deposit/withdraw analysis
    const processAnalysis = (data: any[]) => {
      const result = { total: 0, funded: 0, pending: 0, success: 0, failed: 0 };
      data.forEach((item) => {
        result.total += item.total;
        if (item._id === TransactionStatus.FUNDED) result.funded = item.total;
        if (item._id === TransactionStatus.PENDING) result.pending = item.total;
        if (item._id === TransactionStatus.SUCCESS) result.success = item.total;
        if (item._id === TransactionStatus.FAILED) result.failed = item.total;
      });
      return result;
    };

    // Process funded transactions analysis
    const fundedSummary = {
      totalAmount: 0,
      pendingAmount: 0,
      successAmount: 0,
      failedAmount: 0,
      totalCount: 0,
      pendingCount: 0,
      successCount: 0,
      failedCount: 0,
    };
    fundedTransactionsSummary.forEach((item) => {
      fundedSummary.totalAmount += item.totalAmount;
      fundedSummary.totalCount += item.count;

      if (item._id === FundedTransactionStatus.PENDING) {
        fundedSummary.pendingAmount = item.totalAmount;
        fundedSummary.pendingCount = item.count;
      }
      if (item._id === FundedTransactionStatus.SUCCESS) {
        fundedSummary.successAmount = item.totalAmount;
        fundedSummary.successCount = item.count;
      }
      if (item._id === FundedTransactionStatus.FAILED) {
        fundedSummary.failedAmount = item.totalAmount;
        fundedSummary.failedCount = item.count;
      }
    });

    // Calculate growth metrics
    const previousStats = previousPeriodStats[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      totalFunded: 0,
    };
    const revenueGrowth =
      previousStats.totalRevenue > 0
        ? ((mainSummary.totalRevenue - previousStats.totalRevenue) / previousStats.totalRevenue) *
          100
        : 0;
    const transactionGrowth =
      previousStats.totalTransactions > 0
        ? ((mainSummary.totalTransactions - previousStats.totalTransactions) /
            previousStats.totalTransactions) *
          100
        : 0;
    const fundingGrowth =
      previousStats.totalFunded > 0
        ? ((mainSummary.totalFundedTransactions - previousStats.totalFunded) /
            previousStats.totalFunded) *
          100
        : 0;

    // Build response
    const response: TransactionAnalysisResponse = {
      summary: {
        totalRevenue: mainSummary.totalRevenue,
        totalFundedRevenue: mainSummary.totalFundedRevenue,
        totalFundedFromFundedTransactions: fundedSummary.successAmount,
        totalPendingFunded: fundedSummary.pendingAmount,
        totalTransactions: mainSummary.totalTransactions,
        totalFundedTransactions: mainSummary.totalFundedTransactions,
        averageTransactionValue: mainSummary.averageAmount,
        fundingRate:
          mainSummary.totalTransactions > 0
            ? (mainSummary.totalFundedTransactions / mainSummary.totalTransactions) * 100
            : 0,
      },
      revenueAnalysis: {
        deposits: processAnalysis(depositAnalysis),
        withdraws: processAnalysis(withdrawAnalysis),
      },
      fundedTransactionsAnalysis: fundedSummary,
      timeSeriesData,
      topMetrics: {
        highestTransaction: topTransactions[0]?.highest || 0,
        lowestTransaction: topTransactions[0]?.lowest || 0,
        mostCommonCurrency: currencyStats[0]?._id || 'EGP',
        averageFundingTime: fundingTimeData[0]?.averageFundingTime,
      },
      growthMetrics: {
        revenueGrowth,
        transactionGrowth,
        fundingGrowth,
      },
      currencyBreakdown: currencyData,
    };

    res.status(200).json({
      message: 'success',
      ...response,
    });
  } catch (error) {
    console.error('Transaction analysis error:', error);
    throw error;
  }
};
