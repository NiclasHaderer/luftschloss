import { db } from "./db";
import { HTTPException } from "@luftschloss/server";
import * as fs from "fs";
import { environment } from "../../environments/environment.prod";
import { createJWT } from "./jwt";
import { JWKSResponse, JWTResponse } from "../models";
import * as crypto from "crypto";

/**
 * Creates a new user with username and password and store it in the database.
 * @param username The username of the new user
 * @param password The password of the new user
 * @throws HTTPException if the username already exists
 */
export async function createUser(username: string, password: string) {
  await asssertUsernameDuplicate(username);

  //sqllite autoincrement id
  const command = `INSERT INTO users (username, password) VALUES (?, ?)`;
  await db.run(command, [username, password]);
}

/**
 * Updates the password of the user with the given username.
 * @param username The username of the user
 * @param oldPassword The old password of the user
 * @param newPassword The new password of the user
 * @throws HTTPException if the username does not exist
 * @throws HTTPException if the old password is not correct
 */
export async function updateUser(username: string, oldPassword: string, newPassword: string) {
  await assertUsernameExists(username);
  await assertPasswordCorrect(username, oldPassword);

  const command = `
        UPDATE urls
        SET url = ?
        WHERE id = ?;`;

  await db.run(command, [newPassword, username]);
}

/**
 * Returns a JWT for the user with the given username.
 * @param username The username of the user
 * @param password The password of the user
 * @throws HTTPException if the username does not exist
 * @throws HTTPException if the password is not correct
 * @returns The JWT
 **/
export async function getJWT(username: string, password: string): Promise<JWTResponse> {
  await assertUsernameExists(username);
  await assertPasswordCorrect(username, password);

  const privateKey = await fs.promises.readFile(environment.locationPrivateKey, "utf-8");
  const token = createJWT(username, privateKey);
  return token;
}

export async function getJWKS(): Promise<JWKSResponse> {
  const publicKey = await fs.promises.readFile(environment.locationPublicKey, "utf-8");
  const publicKeyObject = crypto.createPublicKey(publicKey).export({ format: "jwk" });

  const jwks: JWKSResponse = {
    keys: [
      {
        kty: publicKeyObject.kty!,
        e: publicKeyObject.e!,
        use: "sign",
        kid: "luftschloss",
        n: publicKeyObject.n!,
      },
    ],
  };

  return jwks;
}

/**
 * Asserts that the user with the given username exists.
 * @param username The username to check
 * @throws HTTPException if the username does already exist
 */
const assertUsernameExists = async (username: string) => {
  const command = `
    SELECT *
    FROM users
    WHERE username = ?
    LIMIT 1;
    `;

  const exists = await db.get(command, [username]).then(r => !!r);
  if (!exists) throw new HTTPException(403, "forbidden - username does not exist");
};

const asssertUsernameDuplicate = async (username: string) => {
  const command = `
    SELECT *
    FROM users
    WHERE username = ?
    LIMIT 1;
    `;
  const exists = await db.get(command, [username]).then(r => !!r);
  if (exists) throw new HTTPException(409, "duplicate - username already exists");
};

/**
 * Asserts that old password is correct.
 * @param username The username to check
 * @param oldPassword The old password to check
 * @throws HTTPException if the old password is not correct
 */
const assertPasswordCorrect = async (username: string, password: string) => {
  const command = `
    SELECT *
    FROM users
    WHERE username = ? AND password = ?
    LIMIT 1;
    `;

  const exists = await db.get(command, [username, password]).then(r => !!r);
  if (!exists) throw new HTTPException(403, "forbidden - password is not correct");
};
