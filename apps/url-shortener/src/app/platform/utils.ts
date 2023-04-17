import { get } from "@luftschloss/client";
import { HTTPException } from "@luftschloss/server";
import { db } from "./db";

/**
 * Asserts that the given url is reachable.
 * @param url The url to check
 * @throws HTTPException if the url is not reachable
 */
export const assertUrlIsReachable = async (url: URL) => {
  await get(url, { timeout: 2000, followRedirects: true })
    .send()
    .catch(() => {
      throw new HTTPException(400, "Url is not reachable");
    })
    .then(r => {
      if (!r.ok) throw new HTTPException(400, "URL returned a non-success status code");
    });
};

/**
 * Asserts that the url with the given id exists.
 * @param id The id of the url
 * @throws HTTPException if the url does not exist
 */
export const assertUrlExists = async (id: string) => {
  const exists = await db
    .get(
      `
        SELECT *
        FROM urls
        WHERE id = ?;
      `,
      [id]
    )
    .then(r => !!r);

  if (!exists) throw new HTTPException(404, "Url not found");
};

export const assertIsRightUser = async (id: string, userId: string) => {
  await assertUrlExists(id);
  const { user: dbUser } = await db
    .get<{ user: string }>(
      `
      SELECT user
      from urls
      where id = ?
    `,
      [userId]
    )
    .then(r => r!);
  if (dbUser !== userId) throw new HTTPException(403, "Wrong user ID");
};
