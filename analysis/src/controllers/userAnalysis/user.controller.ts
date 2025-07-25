import { 
  Users, 
  Rank, 
  ProjectCycle, 
  Contracts, 
  ProjectContract,
  CopyrightContracts,
  ProducerContract,
  RentalContracts,
  CYCLES
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

interface AnalysisQuery {
  from?: string;
  to?: string;
}

interface UserAnalysisResponse {
  projectStats: {
    totalProjects: number;
    projectsByDate: Array<{ date: string; count: number }>;
  };
  userStats: {
    totalUsers: number;
    onlineUsers: number;
    newUsers: number;
    usersByRank: Array<{ rank: string; count: number; color: string }>;
  };
  contractStats: {
    totalContracts: number;
    contractsByStatus: Array<{ status: string; count: number }>;
    contractsByCycle: Array<{ 
      cycle: string; 
      count: number; 
      statusBreakdown: Array<{ status: string; count: number }> 
    }>;
  };
}

// Helper method to get contract stats by cycle
async function getContractStatsByCycle(
  cycle: CYCLES, 
  ContractModel: any, 
  statusEnumName: string, 
  filter: any
) {
  const contracts = await ContractModel.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusBreakdown = contracts.map((contract: any) => ({
    status: contract._id,
    count: contract.count
  }));

  const totalCount = contracts.reduce((sum: number, contract: any) => sum + contract.count, 0);

  return {
    cycle,
    count: totalCount,
    statusBreakdown
  };
}

export const userAnalysisCrmHandler: RequestHandler<
  unknown,
  any,
  unknown,
  AnalysisQuery
> = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Build date filter
    const dateFilter: any = {};
    if (from) {
      dateFilter.$gte = new Date(from);
    }
    if (to) {
      dateFilter.$lte = new Date(to);
    }
    
    // 1. Project Statistics from portfolio-post
    const projectFilter: any = { isDeleted: { $ne: true } };
    if (Object.keys(dateFilter).length > 0) {
      projectFilter.createdAt = dateFilter;
    }
    
    const [totalProjects, projectsByDate] = await Promise.all([
      ProjectCycle.countDocuments(projectFilter),
      ProjectCycle.aggregate([
        { $match: projectFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } }
      ])
    ]);

    // 2. User Statistics
    const userFilter: any = { isDeleted: { $ne: true } };
    const newUserFilter: any = { isDeleted: { $ne: true } };
    
    if (Object.keys(dateFilter).length > 0) {
      newUserFilter.createdAt = dateFilter;
    }

    const [totalUsers, onlineUsers, newUsers, usersByRank, allRanks] = await Promise.all([
      Users.countDocuments(userFilter),
      Users.countDocuments({ ...userFilter, isOnline: true }),
      Users.countDocuments(newUserFilter),
      Users.aggregate([
        { $match: userFilter },
        {
          $group: {
            _id: '$rank.title',
            count: { $sum: 1 },
            color: { $first: '$rank.color' }
          }
        },
        { $project: { rank: '$_id', count: 1, color: 1, _id: 0 } }
      ]),
      Rank.find({}, { rank: 1, color: 1, _id: 0 })
    ]);

    // Merge ranks with zero counts for missing ranks
    const rankMap = new Map(usersByRank.map(r => [r.rank, r]));
    const completeUsersByRank = allRanks.map(rank => ({
      rank: rank.rank,
      count: rankMap.get(rank.rank)?.count || 0,
      color: rank.color
    }));

    // 3. Contract Statistics
    const contractFilter: any = {};
    if (Object.keys(dateFilter).length > 0) {
      contractFilter.createdAt = dateFilter;
    }

    // Get total contracts count
    const totalContracts = await Contracts.countDocuments(contractFilter);

    // Get contracts by cycle with status breakdown
    const contractsByCycle = await Promise.all([
      // Portfolio Post Contracts
      getContractStatsByCycle(CYCLES.portfolioPost, ProjectContract, 'ProjectContractStatus', contractFilter),
      
      // Copyright Contracts  
      getContractStatsByCycle(CYCLES.copyRights, CopyrightContracts, 'CopyrightContractStatus', contractFilter),
      
      // Producer Contracts
      getContractStatsByCycle(CYCLES.producer, ProducerContract, 'ContractStatus', contractFilter),
      
      // Studio Booking Contracts
      getContractStatsByCycle(CYCLES.studioBooking, RentalContracts, 'RentalContractStatus', contractFilter)
    ]);

    // Get overall contract status breakdown
    const allContractStatuses = contractsByCycle.flatMap((cycle: any) => 
      cycle.statusBreakdown.map((status: any) => ({ status: status.status, count: status.count }))
    );
    
    const statusMap = new Map<string, number>();
    allContractStatuses.forEach(({ status, count }: { status: string; count: number }) => {
      statusMap.set(status, (statusMap.get(status) || 0) + count);
    });
    
    const contractsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    const response: UserAnalysisResponse = {
      projectStats: {
        totalProjects,
        projectsByDate
      },
      userStats: {
        totalUsers,
        onlineUsers,
        newUsers,
        usersByRank: completeUsersByRank
      },
      contractStats: {
        totalContracts,
        contractsByStatus,
        contractsByCycle: contractsByCycle.filter(cycle => cycle.count > 0)
      }
    };

    res.status(200).json({
      success: true as const,
      message: 'success' as const,
      data: response
    });

  } catch (error) {
    console.error('User analysis error:', error);
    res.status(500).json({
      success: false as const,
      message: 'success' as const
    });
  }
};