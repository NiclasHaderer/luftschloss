import { LuftURL } from "@luftschloss/validation";
import { faker } from "@faker-js/faker";

export const mockURL = <T extends LuftURL>(validator: T): URL => {
  const url = new URL(faker.internet.url());
  if (validator.schema.protocols && !(url.protocol in validator.schema.protocols)) {
    url.protocol = validator.schema.protocols[0];
  }

  return url;
};
