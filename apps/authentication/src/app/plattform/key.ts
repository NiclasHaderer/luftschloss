import * as crypto from "crypto";
import * as fs from "fs";
import { environment } from "../../environments/environment.prod";

export async function generateKey() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "top secret",
    },
  });

  console.log(publicKey);
  console.log(privateKey);

  await fs.promises.writeFile(environment.locationPublicKey, publicKey);
  await fs.promises.writeFile(environment.locationPrivateKey, privateKey);
}
