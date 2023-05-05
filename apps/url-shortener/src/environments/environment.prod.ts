// todo get location of auth service from env variable for kubernetes
export const environment = {
  production: true,
  authServiceUrl: process.env.AUTH_SERVICE_URL,
  db: {
    name: "shortener.db",
  },
};
