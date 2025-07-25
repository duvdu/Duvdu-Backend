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
  topUsers: {
    byProjects: Array<{
      _id: string;
      name: string;
      username: string;
      profileImage: string;
      acceptedProjectsCounter: number;
      rank: { title: string; color: string };
    }>;
    byRating: Array<{
      _id: string;
      name: string;
      username: string;
      profileImage: string;
      averageRating: number;
      totalRaters: number;
      rank: { title: string; color: string };
    }>;
    byLikes: Array<{
      _id: string;
      name: string;
      username: string;
      profileImage: string;
      likes: number;
      rank: { title: string; color: string };
    }>;
    byFollowers: Array<{
      _id: string;
      name: string;
      username: string;
      profileImage: string;
      followers: number;
      rank: { title: string; color: string };
    }>;
    byContracts: Array<{
      _id: string;
      name: string;
      username: string;
      profileImage: string;
      contractsCount: number;
      rank: { title: string; color: string };
    }>;
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

    // 3. Contract filter for top users by contracts
    const contractFilter: any = {};
    if (Object.keys(dateFilter).length > 0) {
      contractFilter.createdAt = dateFilter;
    }

    const [totalUsers, onlineUsers, newUsers, usersByRank, allRanks, topUsersByProjects, topUsersByRating, topUsersByLikes, topUsersByFollowers, topUsersByContracts] = await Promise.all([
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
      Rank.find({}, { rank: 1, color: 1, _id: 0 }),
      
      // Top users by accepted projects
      Users.aggregate([
        { $match: userFilter },
        { $sort: { acceptedProjectsCounter: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 1,
            name: 1,
            username: 1,
            profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$profileImage'] },
            acceptedProjectsCounter: 1,
            rank: 1
          }
        }
      ]),
      
      // Top users by rating
      Users.aggregate([
        { $match: { ...userFilter, 'rate.ratersCounter': { $gt: 0 } } },
        {
          $addFields: {
            averageRating: {
              $cond: {
                if: { $gt: ['$rate.ratersCounter', 0] },
                then: { $divide: ['$rate.totalRates', '$rate.ratersCounter'] },
                else: 0
              }
            }
          }
        },
        { $sort: { averageRating: -1, 'rate.ratersCounter': -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 1,
            name: 1,
            username: 1,
            profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$profileImage'] },
            averageRating: 1,
            totalRaters: '$rate.ratersCounter',
            rank: 1
          }
        }
      ]),
      
      // Top users by likes
      Users.aggregate([
        { $match: userFilter },
        { $sort: { likes: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 1,
            name: 1,
            username: 1,
            profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$profileImage'] },
            likes: 1,
            rank: 1
          }
        }
              ]),
        
        // Top users by followers
        Users.aggregate([
          { $match: userFilter },
          { $sort: { 'followCount.followers': -1 } },
          { $limit: 10 },
          {
            $project: {
              _id: 1,
              name: 1,
              username: 1,
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$profileImage'] },
              followers: '$followCount.followers',
              rank: 1
            }
          }
        ]),
        
        // Top users by contracts as service provider (SP)
        Contracts.aggregate([
          { $match: contractFilter },
          {
            $group: {
              _id: '$sp',
              contractsCount: { $sum: 1 }
            }
          },
          { $sort: { contractsCount: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          { $unwind: '$userDetails' },
          {
            $match: {
              'userDetails.isDeleted': { $ne: true }
            }
          },
          {
            $project: {
              _id: '$userDetails._id',
              name: '$userDetails.name',
              username: '$userDetails.username',
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$userDetails.profileImage'] },
              contractsCount: 1,
              rank: '$userDetails.rank'
            }
          }
        ])
    ]);

    // Merge ranks with zero counts for missing ranks
    const rankMap = new Map(usersByRank.map(r => [r.rank, r]));
    const completeUsersByRank = allRanks.map(rank => ({
      rank: rank.rank,
      count: rankMap.get(rank.rank)?.count || 0,
      color: rank.color
    }));

    // 4. Contract Statistics

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
      topUsers: {
        byProjects: topUsersByProjects,
        byRating: topUsersByRating,
        byLikes: topUsersByLikes,
        byFollowers: topUsersByFollowers,
        byContracts: topUsersByContracts
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