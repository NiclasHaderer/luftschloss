import { get } from "@luftschloss/client";

const main = async () => {
  const res = await get("https://picsum.photos/200");
  console.log(res);
};

void main();
