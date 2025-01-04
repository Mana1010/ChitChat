export function randomizeData(arr: string[]) {
  const randomize = Math.floor(Math.random() * arr.length);

  return arr[randomize];
}
