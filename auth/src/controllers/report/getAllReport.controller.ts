import 'express-async-errors';
import { Report } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { GetReportsHandler } from '../../types/endpoints/report.endpoints';

export const getReportsPagination: RequestHandler<
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
  if (req.query.feedback) {
    req.pagination.filter['state.feedback'] = req.query.feedback;
  }
  if (req.query.sourceUser) {
    req.pagination.filter['sourceUser'] = req.query.sourceUser;
  }
  next();
};

export const getReportsHandler: GetReportsHandler = async (req, res) => {
  const resultCount = await Report.countDocuments(req.pagination.filter);

  // Paginate and fetch reports
  const reports = await Report.find(req.pagination.filter)
    .sort('-createdAt')
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .populate({
      path: 'project',
      populate: {
        path: 'project.type',
      },
    });

  // Send response with paginated data and metadata
  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: reports,
  });
};
