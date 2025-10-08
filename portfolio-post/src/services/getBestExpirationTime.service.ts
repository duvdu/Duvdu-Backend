import { BadRequestError, NotFound, Setting } from '@duvdu-v1/duvdu';

export async function getBestExpirationTime(isoDate: string, currentDateCairo: string, lang: string): Promise<{bestTime: number, newDate: Date}> {
  // Both dates are already in Cairo timezone - no conversion needed
  const givenDate = new Date(isoDate);
  const currentDate = new Date(currentDateCairo);

  let newDate = givenDate;


  const settings = await Setting.findOne().exec();

  if (!settings) {
    throw new NotFound({ en: 'setting not found', ar: 'الإعداد غير موجود' }, lang);
  }

  // Use default 24 hours if expirationTime is not set
  const defaultExpirationTime = [{ time: 12 }];
  const expirationTimeData = settings.expirationTime && settings.expirationTime.length > 0 
    ? settings.expirationTime 
    : defaultExpirationTime;

  const timeDifferenceInHours = Math.abs(
    (givenDate.getTime() - currentDate.getTime() + (2 * 60 * 1000)) / (1000 * 60 * 60),
  );


  const validTimes = expirationTimeData
    .map((entry) => entry.time)
    .filter((time) => time * 2 <= timeDifferenceInHours);

  // If no valid times found, get lowest time and check if adding it keeps same day
  if (validTimes.length === 0) {
    // Get the lowest/minimum expiration time from all available times
    const allTimes = expirationTimeData.map((entry) => entry.time);
    const lowestTime = Math.min(...allTimes);
    
    // Add the lowest time to the given date
    newDate = new Date(givenDate.getTime() + ((lowestTime * 2) * 60 * 60 * 1000));
    
    // Check if the new date is the same day as the given date
    const givenDateDay = givenDate.toDateString(); // "Mon Jan 01 2024"
    const newDateDay = newDate.toDateString();     // "Mon Jan 01 2024"
    
    if (givenDateDay !== newDateDay) {
      throw new BadRequestError(
        {
          en: `Please book for the next day as the minimum expiration time (${lowestTime * 2} hours) would extend beyond today`,
          ar: `يرجى الحجز لليوم التالي حيث أن الحد الأدنى لوقت انتهاء الصلاحية (${lowestTime * 2} ساعة) سيمتد إلى ما بعد اليوم`,
        },
        lang,
      );
    }
    
    // If same day, return the lowest time
    return {bestTime: lowestTime, newDate};
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

  return {bestTime , newDate};
}
