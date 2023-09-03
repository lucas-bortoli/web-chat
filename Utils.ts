export function removeFromArray<T>(array: T[], item: T) {
  for (let i = array.length; i--; ) {
    if (array[i] === item) array.splice(i, 1);
  }
}
