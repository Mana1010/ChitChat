export function capitalizeFirstLetter(word: string | undefined) {
  if (word) {
    return word.replace(/^\w/, (c) => c.toUpperCase());
  }
  return word;
}
