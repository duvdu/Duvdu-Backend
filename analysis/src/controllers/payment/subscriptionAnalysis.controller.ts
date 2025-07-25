import {
  Transaction,
  TransactionStatus,
  TransactionType,
  SuccessResponse,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

interface SubscriptionAnalysisQuery {
  interval?: 'today' | 'week' | 'month' | 'custom';
  from?: string;
  to?: string;
  currency?: string;
}

interface SubscriptionAnalysisResponse {
  summary: {
    totalSubscriptionRevenue: number;
    activeSubscriptions: number;
    newSubscriptions: number;
    cancelledSubscriptions: number;
    averageSubscriptionValue: number;
    monthlyRecurringRevenue: number; // MRR
    annualRecurringRevenue: number; // ARR
    churnRate: number; // percentage
    retentionRate: number; // percentage
  };
  revenueAnalysis: {
    deposits: {
      total: number;
      pending: number;
      success: number;
      failed: number;
      funded: number;
    };
    withdraws: {
      total: number;
      pending: number;
      success: number;
      failed: number;
      funded: number;
    };
  };
  subscriptionTiers: {
    tierAnalysis: Array<{
      amount: number;
      count: number;
      revenue: number;
      percentage: number;
    }>;
  };
  timeSeriesData: {
    date: string;
    subscriptionRevenue: number;
    newSubscriptions: number;
    cancelledSubscriptions: number;
    netSubscriptions: number;
    mrr: number;
  }[];
  userMetrics: {
    totalSubscribedUsers: number;
    newSubscribedUsers: number;
    averageLifetimeValue: number;
    subscriptionPenetration: number; // percentage of total users
  };
  growthMetrics: {
    revenueGrowth: number; // percentage
    subscriptionGrowth: number; // percentage
    mrrGrowth: number; // percentage
    churnGrowthRate: number; // percentage
  };
  topMetrics: {
    highestSubscription: number;
    lowestSubscription: number;
    mostCommonSubscriptionAmount: number;
    averageSubscriptionDuration: number; // in days
  };
  currencyBreakdown: {
    currency: string;
    subscriptionRevenue: number;
    subscriptionCount: number;
    averageValue: number;
  }[];
  cohortAnalysis: {
    month: string;
    newSubscribers: number;
    retainedSubscribers: number;
    retentionRate: number;
  }[];
}

export const subscriptionAnalysisController: RequestHandler<
  unknown,
  SuccessResponse<SubscriptionAnalysisResponse>,
  unknown,
  SubscriptionAnalysisQuery
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

    // Build subscription transaction filter
    const subscriptionFilter: any = { 
      isSubscription: true 
    };
    
    if (Object.keys(dateFilter).length > 0) {
      subscriptionFilter.timeStamp = dateFilter;
    }
    
    if (currency) {
      subscriptionFilter.currency = currency;
    }

    // Previous period filter for growth calculations
    const previousPeriodFilter = { ...subscriptionFilter };
    if (Object.keys(dateFilter).length > 0) {
      const periodLength = dateFilter.$lte ? 
        new Date(dateFilter.$lte).getTime() - new Date(dateFilter.$gte).getTime() : 
        30 * 24 * 60 * 60 * 1000; // 30 days default
      
      const prevStart = new Date(new Date(dateFilter.$gte).getTime() - periodLength);
      const prevEnd = new Date(dateFilter.$gte);
      previousPeriodFilter.timeStamp = { $gte: prevStart, $lt: prevEnd };
    }

    // Execute all queries in parallel for optimal performance
    const [
      // Main subscription summary
      subscriptionSummary,
      
      // Revenue analysis by type
      depositAnalysis,
      withdrawAnalysis,
      
      // Subscription tiers analysis
      subscriptionTiers,
      
      // Time series data
      timeSeriesData,
      
      // Currency breakdown
      currencyData,
      
      // User metrics
      totalUsers,
      subscribedUsers,
      newSubscribedUsers,
      
      // Top metrics
      topSubscriptionMetrics,
      subscriptionDurations,
      
      // Previous period for growth
      previousPeriodStats,
      
      // Cohort analysis
      cohortData,
      
      // Most common subscription amount
      commonSubscriptionAmount,
    ] = await Promise.all([
      // Main subscription summary
      Transaction.aggregate([
        { $match: subscriptionFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalSubscriptions: { $sum: 1 },
            averageAmount: { $avg: '$amount' },
            activeSubscriptions: {
              $sum: { 
                $cond: [
                  { $in: ['$status', [TransactionStatus.SUCCESS, TransactionStatus.FUNDED]] }, 
                  1, 
                  0
                ] 
              }
            },
            cancelledSubscriptions: {
              $sum: { 
                $cond: [
                  { $eq: ['$status', TransactionStatus.FAILED] }, 
                  1, 
                  0
                ] 
              }
            },
          },
        },
      ]),

      // Deposit analysis for subscriptions
      Transaction.aggregate([
        { $match: { ...subscriptionFilter, type: TransactionType.DEPOSIT } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Withdraw analysis for subscriptions
      Transaction.aggregate([
        { $match: { ...subscriptionFilter, type: TransactionType.WITHDRAW } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Subscription tiers analysis
      Transaction.aggregate([
        { $match: subscriptionFilter },
        {
          $group: {
            _id: '$amount',
            count: { $sum: 1 },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { revenue: -1 } },
        {
          $project: {
            amount: '$_id',
            count: 1,
            revenue: 1,
            _id: 0,
          },
        },
      ]),

      // Time series data
      Transaction.aggregate([
        { $match: subscriptionFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timeStamp' } },
            subscriptionRevenue: { $sum: '$amount' },
            newSubscriptions: {
              $sum: { 
                $cond: [
                  { $in: ['$status', [TransactionStatus.SUCCESS, TransactionStatus.FUNDED]] }, 
                  1, 
                  0
                ] 
              }
            },
            cancelledSubscriptions: {
              $sum: { 
                $cond: [
                  { $eq: ['$status', TransactionStatus.FAILED] }, 
                  1, 
                  0
                ] 
              }
            },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: '$_id',
            subscriptionRevenue: 1,
            newSubscriptions: 1,
            cancelledSubscriptions: 1,
            netSubscriptions: { $subtract: ['$newSubscriptions', '$cancelledSubscriptions'] },
            _id: 0,
          },
        },
      ]),

      // Currency breakdown
      Transaction.aggregate([
        { $match: subscriptionFilter },
        {
          $group: {
            _id: '$currency',
            subscriptionRevenue: { $sum: '$amount' },
            subscriptionCount: { $sum: 1 },
            averageValue: { $avg: '$amount' },
          },
        },
        { $sort: { subscriptionRevenue: -1 } },
        {
          $project: {
            currency: '$_id',
            subscriptionRevenue: 1,
            subscriptionCount: 1,
            averageValue: 1,
            _id: 0,
          },
        },
      ]),

      // Total users count
      Users.countDocuments({ isDeleted: { $ne: true } }),

      // Subscribed users (users with successful subscription transactions)
      Transaction.aggregate([
        { 
          $match: { 
            isSubscription: true,
            status: { $in: [TransactionStatus.SUCCESS, TransactionStatus.FUNDED] }
          } 
        },
        { $group: { _id: '$user' } },
        { $count: 'subscribedUsers' },
      ]),

      // New subscribed users in current period
      Transaction.aggregate([
        { 
          $match: { 
            ...subscriptionFilter,
            status: { $in: [TransactionStatus.SUCCESS, TransactionStatus.FUNDED] }
          } 
        },
        { $group: { _id: '$user' } },
        { $count: 'newSubscribedUsers' },
      ]),

      // Top subscription metrics
      Transaction.aggregate([
        { $match: subscriptionFilter },
        {
          $group: {
            _id: null,
            highest: { $max: '$amount' },
            lowest: { $min: '$amount' },
          },
        },
      ]),

      // Average subscription duration (mock calculation based on transaction patterns)
      Transaction.aggregate([
        { 
          $match: { 
            isSubscription: true,
            status: { $in: [TransactionStatus.SUCCESS, TransactionStatus.FUNDED] }
          } 
        },
        {
          $group: {
            _id: '$user',
            firstSubscription: { $min: '$timeStamp' },
            lastSubscription: { $max: '$timeStamp' },
            subscriptionCount: { $sum: 1 },
          },
        },
        {
          $project: {
            duration: { 
              $divide: [
                { $subtract: ['$lastSubscription', '$firstSubscription'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            },
          },
        },
        {
          $group: {
            _id: null,
            averageDuration: { $avg: '$duration' },
          },
        },
      ]),

      // Previous period statistics
      Transaction.aggregate([
        { $match: previousPeriodFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalSubscriptions: { $sum: 1 },
            activeSubscriptions: {
              $sum: { 
                $cond: [
                  { $in: ['$status', [TransactionStatus.SUCCESS, TransactionStatus.FUNDED]] }, 
                  1, 
                  0
                ] 
              }
            },
          },
        },
      ]),

      // Cohort analysis (monthly retention)
      Transaction.aggregate([
        { 
          $match: { 
            isSubscription: true,
            status: { $in: [TransactionStatus.SUCCESS, TransactionStatus.FUNDED] }
          } 
        },
        {
          $group: {
            _id: {
              user: '$user',
              month: { $dateToString: { format: '%Y-%m', date: '$timeStamp' } },
            },
            firstTransaction: { $min: '$timeStamp' },
          },
        },
        {
          $group: {
            _id: '$_id.month',
            newSubscribers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            month: '$_id',
            newSubscribers: 1,
            retainedSubscribers: '$newSubscribers', // Simplified - would need more complex logic for true retention
            retentionRate: 100, // Simplified calculation
            _id: 0,
          },
        },
      ]),

      // Most common subscription amount
      Transaction.aggregate([
        { $match: subscriptionFilter },
        {
          $group: {
            _id: '$amount',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    // Process results
    const mainSummary = subscriptionSummary[0] || {
      totalRevenue: 0,
      totalSubscriptions: 0,
      averageAmount: 0,
      activeSubscriptions: 0,
      cancelledSubscriptions: 0,
    };

    // Calculate MRR and ARR (simplified calculation)
    const monthlyRecurringRevenue = mainSummary.totalRevenue; // Simplified - assumes all revenue is monthly
    const annualRecurringRevenue = monthlyRecurringRevenue * 12;

    // Calculate churn and retention rates
    const churnRate = mainSummary.totalSubscriptions > 0 ? 
      (mainSummary.cancelledSubscriptions / mainSummary.totalSubscriptions) * 100 : 0;
    const retentionRate = 100 - churnRate;

    // Process deposit/withdraw analysis
    const processRevenueAnalysis = (data: any[]) => {
      const result = { total: 0, pending: 0, success: 0, failed: 0, funded: 0 };
      data.forEach(item => {
        result.total += item.total;
        if (item._id === TransactionStatus.PENDING) result.pending = item.total;
        if (item._id === TransactionStatus.SUCCESS) result.success = item.total;
        if (item._id === TransactionStatus.FAILED) result.failed = item.total;
        if (item._id === TransactionStatus.FUNDED) result.funded = item.total;
      });
      return result;
    };

    // Process subscription tiers with percentages
    const totalTierRevenue = subscriptionTiers.reduce((sum, tier) => sum + tier.revenue, 0);
    const tiersWithPercentage = subscriptionTiers.map(tier => ({
      ...tier,
      percentage: totalTierRevenue > 0 ? (tier.revenue / totalTierRevenue) * 100 : 0,
    }));

    // Add MRR calculation to time series data
    const enhancedTimeSeriesData = timeSeriesData.map(day => ({
      ...day,
      mrr: day.subscriptionRevenue, // Simplified MRR calculation
    }));

    // User metrics calculations
    const totalUserCount = totalUsers;
    const subscribedUserCount = subscribedUsers[0]?.subscribedUsers || 0;
    const newSubscribedUserCount = newSubscribedUsers[0]?.newSubscribedUsers || 0;
    
    const subscriptionPenetration = totalUserCount > 0 ? 
      (subscribedUserCount / totalUserCount) * 100 : 0;
    
    const averageLifetimeValue = subscribedUserCount > 0 ? 
      mainSummary.totalRevenue / subscribedUserCount : 0;

    // Growth metrics calculations
    const previousStats = previousPeriodStats[0] || { 
      totalRevenue: 0, 
      totalSubscriptions: 0, 
      activeSubscriptions: 0 
    };
    
    const revenueGrowth = previousStats.totalRevenue > 0 ? 
      ((mainSummary.totalRevenue - previousStats.totalRevenue) / previousStats.totalRevenue) * 100 : 0;
    
    const subscriptionGrowth = previousStats.totalSubscriptions > 0 ? 
      ((mainSummary.totalSubscriptions - previousStats.totalSubscriptions) / previousStats.totalSubscriptions) * 100 : 0;
    
    const mrrGrowth = revenueGrowth; // Simplified calculation
    const churnGrowthRate = subscriptionGrowth < 0 ? Math.abs(subscriptionGrowth) : 0;

    // Build comprehensive response
    const response: SubscriptionAnalysisResponse = {
      summary: {
        totalSubscriptionRevenue: mainSummary.totalRevenue,
        activeSubscriptions: mainSummary.activeSubscriptions,
        newSubscriptions: mainSummary.totalSubscriptions,
        cancelledSubscriptions: mainSummary.cancelledSubscriptions,
        averageSubscriptionValue: mainSummary.averageAmount,
        monthlyRecurringRevenue,
        annualRecurringRevenue,
        churnRate,
        retentionRate,
      },
      revenueAnalysis: {
        deposits: processRevenueAnalysis(depositAnalysis),
        withdraws: processRevenueAnalysis(withdrawAnalysis),
      },
      subscriptionTiers: {
        tierAnalysis: tiersWithPercentage,
      },
      timeSeriesData: enhancedTimeSeriesData,
      userMetrics: {
        totalSubscribedUsers: subscribedUserCount,
        newSubscribedUsers: newSubscribedUserCount,
        averageLifetimeValue,
        subscriptionPenetration,
      },
      growthMetrics: {
        revenueGrowth,
        subscriptionGrowth,
        mrrGrowth,
        churnGrowthRate,
      },
      topMetrics: {
        highestSubscription: topSubscriptionMetrics[0]?.highest || 0,
        lowestSubscription: topSubscriptionMetrics[0]?.lowest || 0,
        mostCommonSubscriptionAmount: commonSubscriptionAmount[0]?._id || 0,
        averageSubscriptionDuration: subscriptionDurations[0]?.averageDuration || 0,
      },
      currencyBreakdown: currencyData,
      cohortAnalysis: cohortData,
    };

    res.status(200).json({
      message: 'success',
      ...response,
    });
  } catch (error) {
    console.error('Subscription analysis error:', error);
    throw error;
  }
};
