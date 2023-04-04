import { LuftURL } from "@luftschloss/validation";
import { faker } from "@faker-js/faker";

export const mockURL = <T extends LuftURL>(validator: T, filedName?: string): URL => {
  return new URL(faker.internet.url());
};
