import * as crypto from "crypto";
import * as fs from "fs";
import { environment } from "../../environments/environment";
import { Cache, Singleton } from "@luftschloss/common";
import { JWK } from "../models";

@Singleton()
export class KeyPairHolder {
  @Cache()
  publicKey() {
    return fs.readFileSync(environment.keypair.publicKeyLocation, "utf8");
  }

  @Cache()
  privateKey() {
    return fs.readFileSync(environment.keypair.privateKeyLocation, "utf8");
  }

  @Cache()
  publicKeyObject() {
    return crypto.createPublicKey(this.publicKey());
  }

  @Cache()
  privateKeyObject() {
    return crypto.createPrivateKey({
      key: this.privateKey(),
      passphrase: "top secret",
    });
  }

  @Cache()
  jwk(): JWK {
    const jwk = crypto.createPublicKey(this.publicKey()).export({ format: "jwk" });
    return {
      kty: "RSA",
      n: jwk.n!,
      e: jwk.e!,
      use: "sign",
      kid: "luftschloss",
      alg: "RS256",
    };
  }

  public async init() {
    if (
      !fs.existsSync(environment.keypair.publicKeyLocation) ||
      !fs.existsSync(environment.keypair.privateKeyLocation)
    ) {
      await this.generateNewKeyPair();
    }
    // Load the keys in memory
    this.publicKey();
    this.privateKey();
  }

  private async generateNewKeyPair() {
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
    await fs.promises.writeFile(environment.keypair.publicKeyLocation, publicKey);
    await fs.promises.writeFile(environment.keypair.privateKeyLocation, privateKey);
  }
}
