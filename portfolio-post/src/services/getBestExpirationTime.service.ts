import { BadRequestError, NotFound, Setting } from '@duvdu-v1/duvdu';

export async function getBestExpirationTime(isoDate: string, lang: string) {
  const givenDate = new Date(isoDate);
  const currentDate = new Date();

  console.log( 'givenDate', givenDate);
  console.log( 'currentDate', currentDate);

  const timeDifferenceInHours = Math.abs(
    (givenDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60),
  );
  console.log(timeDifferenceInHours);

  const settings = await Setting.findOne().exec();

  if (!settings) {
    throw new NotFound({ en: 'setting not found', ar: 'الإعداد غير موجود' }, lang);
  }

  console.log( 'settings', settings);

  // Use default 24 hours if expirationTime is not set
  const defaultExpirationTime = [{ time: 24 }];
  const expirationTimeData = settings.expirationTime && settings.expirationTime.length > 0 
    ? settings.expirationTime 
    : defaultExpirationTime;

  console.log( 'expirationTimeData', expirationTimeData);

  const validTimes = expirationTimeData
    .map((entry) => entry.time)
    .filter((time) => time * 2 <= timeDifferenceInHours);

  console.log( 'validTimes', validTimes);
  if (validTimes.length === 0) {
    throw new BadRequestError(
      {
        en: `the minimum difference time between booking and now must be at least ${expirationTimeData[0].time * 2} hour`,
        ar: `الحد الأدنى للفترة الزمنية بين وقت الحجز والوقت الحالي يجب أن يكون على الأقل ${expirationTimeData[0].time * 2} ساعة`,
      },
      lang,
    );
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
