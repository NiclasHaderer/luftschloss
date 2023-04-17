import { db } from "./db";
import { HTTPException } from "@luftschloss/server";
import { createJWT } from "./jwt";
import { JWKSResponse } from "../models";
import { KeyPairHolder } from "./key";
import * as argon2 from "argon2";

/**
 * Creates a new user with username and password and store it in the database.
 * @param username The username of the new user
 * @param password The password of the new user
 * @throws HTTPException if the username already exists
 */
export async function createUser(username: string, password: string) {
  await assertUserDoesNotExist(username);

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  //SQLite autoincrement id
  await db.run(
    `INSERT INTO users (username, password)
     VALUES (?, ?)`,
    [username, passwordHash]
  );
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
  await assertUserExists(username);
  await assertPasswordCorrect(username, oldPassword);

  const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });

  await db.run(
    `
      UPDATE users
      SET password = ?
      WHERE username = ?
    `,
    [passwordHash, username]
  );
}

/**
 * Returns a JWT for the user with the given username.
 * @param username The username of the user
 * @param password The password of the user
 * @throws HTTPException if the username does not exist
 * @throws HTTPException if the password is not correct
 * @returns The JWT
 **/
export async function getJWT(username: string, password: string): Promise<string> {
  await assertUserExists(username);
  await assertPasswordCorrect(username, password);
  return createJWT(username);
}

export async function getJWKS(): Promise<JWKSResponse> {
  const jwk = new KeyPairHolder().jwk();
  return {
    keys: [
      {
        kty: jwk.kty!,
        e: jwk.e!,
        use: "sign",
        kid: "luftschloss",
        n: jwk.n!,
      },
    ],
  };
}

/**
 * Asserts that the user with the given username exists.
 * @param username The username to check
 * @throws HTTPException if the username does already exist
 */
const assertUserExists = async (username: string) => {
  const command = `
    SELECT *
    FROM users
    WHERE username = ?
    LIMIT 1;
  `;

  const exists = await db.get(command, [username]).then(r => !!r);
  if (!exists) throw new HTTPException(403, "username does not exist");
};

const assertUserDoesNotExist = async (username: string) => {
  const command = `
    SELECT *
    FROM users
    WHERE username = ?
    LIMIT 1;
  `;
  const exists = await db.get(command, [username]).then(r => !!r);
  if (exists) throw new HTTPException(409, "username already exists");
};

/**
 * Asserts that old password is correct.
 * @param username The username to check
 * @param password The password of the user
 * @throws HTTPException if the old password is not correct
 */
const assertPasswordCorrect = async (username: string, password: string) => {
  const user = await db
    .get<{ password: string }>(
      `
        SELECT password
        FROM users
        WHERE username = ?
        LIMIT 1;
      `,
      [username]
    )
    .then(r => r!);

  const correct = await argon2.verify(user.password, password, { type: argon2.argon2id });
  if (!correct) throw new HTTPException(403, "password is not correct");
};

export const deleteUser = async (username: string, password: string) => {
  await assertUserExists(username);
  await assertPasswordCorrect(username, password);

  await db.run(
    `
      DELETE
      FROM users
      WHERE username = ?
    `,
    [username]
  );
};
