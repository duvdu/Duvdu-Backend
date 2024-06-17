import { Setting } from "@duvdu-v1/duvdu";

export async function getBestExpirationTime(isoDate: string) {
  const givenDate = new Date(isoDate);
  const currentDate = new Date();
  
  const timeDifferenceInHours = Math.abs((givenDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60));
  
  const settings = await Setting.findOne().exec();
  
  if (!settings) {
    throw new Error('Settings not found');
  }
  
  const validTimes = settings.expirationTime
    .map((entry) => entry.time)
    .filter((time) => time % 2 === 0 && time * 2 <= timeDifferenceInHours);
  
  if (validTimes.length === 0) {
    throw new Error('No valid expiration times found');
  }
  
  let bestTime = validTimes[0];
  let smallestDifference = Math.abs(timeDifferenceInHours - validTimes[0]);
  
  for (const time of validTimes) {
    const difference = Math.abs(timeDifferenceInHours - time);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestTime = time;
    }
  }
  
  return bestTime;
}