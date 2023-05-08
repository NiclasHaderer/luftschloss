export const environment = {
  keypair: {
    publicKeyLocation: "publicKey.pem",
    privateKeyLocation: "privateKey.pem",
  },
  db: {
    name: process.env.DB_PATH,
  },
  production: true,
};
