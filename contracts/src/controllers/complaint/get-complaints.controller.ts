import { ContractReports, IcontractReport, Iuser, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const xx = '';
export const getComplaintsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    searchKeywords?: string[];
    startDate?: Date;
    endDate?: Date;
    isClosed?: boolean;
    closedById?: string;
    feedback?: string;
    sourceUser?: string;
  }
> = async (req, res, next) => {
  req.pagination.filter = {};
  if (req.query.searchKeywords) {
    req.pagination.filter.$or = req.query.searchKeywords.map((keyword: string) => ({
      desc: { $regex: keyword, $options: 'i' },
    }));
  }
  if (req.query.startDate || req.query.endDate) {
    req.pagination.filter.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }
  if (req.query.isClosed !== undefined) {
    req.pagination.filter['state.isClosed'] = req.query.isClosed;
  }
  if (req.query.closedById) {
    req.pagination.filter['state.closedBy'] = req.query.closedById;
  }
  if (req.query.sourceUser) {
    req.pagination.filter['sourceUser'] = req.query.sourceUser;
  }
  next();
};

export const getComplaintsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IcontractReport[] }>
> = async (req, res) => {
  const resultCount = await ContractReports.countDocuments(req.pagination.filter);

  const complaints = await ContractReports.find(req.pagination.filter)
    .sort('-createdAt')
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .populate([
      {
        path: 'reporter',
        select: 'name username profileImage isOnline',
      },
    ])
    .lean();

  complaints.forEach((complaint: IcontractReport) => {
    (complaint.reporter as Iuser).profileImage =
      process.env.BUCKET_HOST + '/' + (complaint?.reporter as Iuser).profileImage;

    complaint.attachments = complaint.attachments.map((el) => process.env.BUCKET_HOST + '/' + el);
  });

  // Send response with paginated data and metadata
  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: complaints,
  });
};
