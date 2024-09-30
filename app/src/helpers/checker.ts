export default async function<T = unknown> (callback:(arg:T) => Promise<boolean>, ...args:T[]) {
  let value = true
  for (const arg  of args) {
    value = await callback(arg) && value
  }
  return value
}