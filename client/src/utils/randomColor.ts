const colorList = [
  "black",
  "blue",
  "brown",
  "green",
  "orange",
  "pink",
  "red",
  "violet",
  "yellow",
  "white",
];

export function randomColor() {
  const randomize = Math.floor(Math.random() * colorList.length);
  return colorList[randomize];
}
