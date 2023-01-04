export const splitFirst = (str: string, char: string) => {
  const index = str.indexOf(char);
  if (index === -1) return [str];
  return [str.substring(0, index), str.substring(index + 1)];
};
