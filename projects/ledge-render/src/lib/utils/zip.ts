export function zip<T1, T2>(arr1: Array<T1>, arr2: Array<T2>): Array<[T1 | undefined, T2 | undefined]> {
  return arr1.map((value, idx) => [value, arr2[idx]]);
}
