/* eslint-disable indent */
type Units = 'minutes' | 'hours' | 'days' | 'months' | 'weeks';

export const addToDate = (initialDate: Date, unit: Units, value: number) => {
  switch (unit) {
    case 'hours':
      initialDate.setHours(initialDate.getHours() + value);
      break;
    case 'days':
      initialDate.setDate(initialDate.getDate() + value);
      break;
    case 'months':
      initialDate.setMonth(initialDate.getMonth() + value);
      break;
    case 'weeks':
      initialDate.setDate(initialDate.getDate() + value * 7);
      break;
    case 'minutes':
      initialDate.setMinutes(initialDate.getMinutes() + value);
      break;
    default:
      break;
  }
  return initialDate;
};
