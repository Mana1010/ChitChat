export const retrieveFirstName = (name: string) => {
  const splitName = name.split(" ");
  return splitName[0];
};
