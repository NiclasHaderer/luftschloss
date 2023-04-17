import * as crypto from "crypto";
import { JWTResponse } from "../models";

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

export const createJWT = (username: string, privateKey: string): JWTResponse => {
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

  //https://techdocs.akamai.com/iot-token-access-control/docs/generate-jwt-rsa-keys
  const headerString = JSON.stringify(header);
  const payloadString = JSON.stringify(payload);

  const headerBase64 = Buffer.from(headerString).toString("base64");
  const payloadBase64 = Buffer.from(payloadString).toString("base64");
  const Y = headerBase64 + "." + payloadBase64;

  const signature = crypto.sign("RSA256", Buffer.from(Y), privateKey);
  const signatureBase64 = signature.toString("base64");

  return Y + "." + signatureBase64;
};
