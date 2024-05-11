import { MODELS, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { IstudioBookingBook, StudioBookingBook } from '../../models/studio-booking-book.model';
import { generateCode } from '../../utils/crypto';

export const bookProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: IstudioBookingBook }>,
  {
    jobDetails: string;
    equipments: string[];
    address: string;
    location: { lat: number; lng: number };
    bookingHours: number;
    deadline: Date;
  }
> = async (req, res, next) => {
  const project = await mongoose.connection.db
    .collection(MODELS.studioBooking)
    .findOne({ _id: new mongoose.Types.ObjectId(req.params.projectId), isDeleted: { $ne: true } });
  // const project = await studioBooking.findOne({ _id: req.params.projectId, isDeleted: true });
  console.log(project);
  if (!project) return next(new NotFound('Project not found'));
  const equipmentsWithFees: { name: string; fees: number }[] = [];
  // assert equipments
  for (const equipment of req.body.equipments) {
    const equip = project.equipments.find((el: any) => el._id.toString() === equipment);
    if (!equip) return next(new NotFound('Equipment not found in this project'));
    equipmentsWithFees.push(equip);
  }

  const totalPrice =
    equipmentsWithFees.reduce((acc, curr) => acc + curr.fees * req.body.bookingHours, 0) +
    project.insurance +
    project.pricePerHour * req.body.bookingHours;

  const booking = await StudioBookingBook.create({
    ...req.body,
    sourceUser: req.loggedUser.id,
    targetUser: project.user,
    project: project.id,
    equipments: equipmentsWithFees,
    totalPrice,
    qrToken: await generateCode(16),
  });

  booking.qrToken = undefined as any;
  res.status(200).json({ message: 'success', data: booking });
};
