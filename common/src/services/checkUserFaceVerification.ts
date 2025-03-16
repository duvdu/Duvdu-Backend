import { Users } from '../models/User.model';

export async function checkUserFaceVerification(userId: string): Promise<boolean> {
  const user = await Users.findOne({ _id: userId });

  let isVerified = false;
  if (user) {
    isVerified = user.faceRecognition !== null;
  }

  return isVerified;
}
