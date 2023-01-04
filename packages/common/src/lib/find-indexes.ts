export const findIndexes = <T>(array: T[], predicate: (item: T) => boolean): number[] => {
  const indexes: number[] = [];
  array.forEach((item, index) => {
    if (predicate(item)) {
      indexes.push(index);
    }
  });
  return indexes;
};
