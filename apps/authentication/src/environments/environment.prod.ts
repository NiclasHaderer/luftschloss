import * as process from "process";

export const environment = {
  keypair: {
    publicKeyLocation: process.env.PUBLIC_KEY_PATH,
    privateKeyLocation: process.env.PRIVATE_KEY_PATH,
  },
  db: {
    name: process.env.DB_PATH,
  },
  production: true,
};
