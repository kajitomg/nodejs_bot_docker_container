export function getDateNow() {
  const date = new Date();
  
  date.toLocaleString("ru", {
    day:'numeric',
    month:'numeric',
    year:'numeric',
    hour:'numeric',
    minute:'numeric',
    second:'numeric',
    timeZone:'Europe/Moscow'
  })
  
  return date
}