// todo get location of auth service from env variable for kubernetes
import * as process from "process";

export const environment = {
  production: true,
  authServiceUrl: process.env.AUTH_SERVICE_URL,
  db: {
    name: process.env.DB_PATH,
  },
};
