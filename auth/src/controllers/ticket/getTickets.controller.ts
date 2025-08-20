import 'express-async-errors';
import { Ticket, PaginationResponse, Iticket } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const getTicketsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    ticketNumber?: string;
    name?: string;
    userId?: string;
    isClosed?: boolean;
    closedBy?: string;
    startDate?: string;
    endDate?: string;
  }
> = async (req, res, next) => {
  req.pagination.filter = {};

  // Global search functionality - searches across multiple fields
  if (req.query.search) {
    req.pagination.filter.$or = [
      { ticketNumber: { $regex: req.query.search, $options: 'i' } },
      { name: { $regex: req.query.search, $options: 'i' } },
      { message: { $regex: req.query.search, $options: 'i' } },
      { 'state.feedback': { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Individual field filters
  if (req.query.ticketNumber) {
    req.pagination.filter.ticketNumber = { $regex: req.query.ticketNumber, $options: 'i' };
  }

  if (req.query.name) {
    req.pagination.filter.name = { $regex: req.query.name, $options: 'i' };
  }

  if (req.query.userId) {
    req.pagination.filter.userId = new Types.ObjectId(req.query.userId);
  }

  if (req.query.isClosed !== undefined) {
    req.pagination.filter['state.isClosed'] = req.query.isClosed;
  }

  if (req.query.closedBy) {
    req.pagination.filter['state.closedBy'] = new Types.ObjectId(req.query.closedBy);
  }

  if (req.query.startDate || req.query.endDate) {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // If start and end dates are the same, filter for the entire day
    if (req.query.startDate && req.query.endDate && 
        new Date(req.query.startDate).toDateString() === new Date(req.query.endDate).toDateString()) {
      const dayStart = new Date(startDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(startDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      req.pagination.filter.createdAt = {
        $gte: dayStart,
        $lte: dayEnd,
      };
    } else {
      req.pagination.filter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
  }

  next();
};

export const getTicketsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: Iticket[] }>
> = async (req, res) => {
  // Get total count for pagination
  const resultCount = await Ticket.countDocuments(req.pagination.filter);

  // Fetch tickets with pagination and populate user details
  const tickets = await Ticket.find(req.pagination.filter)
    .select('ticketNumber name phoneNumber message userId state createdAt updatedAt')
    .sort('-createdAt')
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .populate({
      path: 'userId',
      select: 'name username email profileImage',
    })
    .populate({
      path: 'state.closedBy',
      select: 'name username email profileImage',
    });

  // Send response with paginated data and metadata
  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: tickets,
  });
};
