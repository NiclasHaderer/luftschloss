import * as crypto from "crypto";
import { KeyPairHolder } from "./key";

interface Header {
  alg: string;
  typ: string;
  kid: string;
}

interface Payload {
  sub: string;
  iat: number;
  iss: string;
  exp: number;
}

export const createJWT = (username: string): string => {
  const header: Header = {
    alg: "RS256",
    typ: "JWT",
    kid: "luftschloss",
  };

  const payload: Payload = {
    sub: username,
    iat: Math.floor(Date.now() / 1000),
    iss: "luftschloss",
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  };

  const headerBase64 = toBase64Url(JSON.stringify(header));
  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const headerPayloadBase64 = `${headerBase64}.${payloadBase64}`;

  const keyPair = new KeyPairHolder();

  const signature = crypto.sign("RSA-SHA256", Buffer.from(headerPayloadBase64), keyPair.privateKeyObject());
  const signatureBase64 = toBase64Url(signature);
  return `${headerPayloadBase64}.${signatureBase64}`;
};

export const toBase64Url = (str: string | Buffer): string => {
  const base64 = Buffer.from(str).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};
