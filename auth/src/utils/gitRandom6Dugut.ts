export function generateRandom6Digit(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
  // return randomNum;
  return '123456';
}
