export default function () {
  const timestamp = Date.now();
  const randomNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
  
  return timestamp + randomNumbers
}