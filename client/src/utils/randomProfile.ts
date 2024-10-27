const profileList = [
  "group-icon-black",
  "group-icon-blue",
  "group-icon-brown",
  "group-icon-green",
  "group-icon-orange",
  "group-icon-pink",
  "group-icon-red",
  "group-icon-violet",
  "group-icon-yellow",
  "group-icon-white",
];

export function randomProfile() {
  const randomize = Math.floor(Math.random() * profileList.length);
  return profileList[randomize];
}
