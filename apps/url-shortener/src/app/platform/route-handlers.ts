import { UrlModel, UrlModels } from "../models";
import { db } from "./db";
import { generateCollisionFreeId } from "./id";
import { assertIsRightUser, assertUrlExists, assertUrlIsReachable } from "./utils";

/**
 * Creates a new url and returns the created model.
 * @param url The url to create
 * @param userId The id of the user who created the url
 */
export const createUrl = async (url: URL, userId: string): Promise<UrlModel> => {
  await assertUrlIsReachable(url);
  const id = await generateCollisionFreeId();
  const command = `INSERT INTO urls (url, id, user)
                   VALUES (?, ?, ?);`;
  await db.run(command, [url.toString(), id, userId]);
  return { url, id };
};

/**
 * Returns the url with the given id.
 * @param id The id of the url
 * @throws HTTPException if the url does not exist
 */
export async function getUrl(id: string): Promise<UrlModel> {
  await assertUrlExists(id);

  const command = `
    SELECT *
    FROM urls
    WHERE id = ?
    LIMIT 1;
  `;

  const row = await db.get(command, [id]);
  return UrlModel.coerce(row);
}

/**
 * Returns all urls.
 * @param userId The id of the user who created the urls
 */
export async function getAllUrlsForUser(userId: string): Promise<UrlModel[]> {
  const command = `SELECT *
                   FROM urls
                   WHERE user = ?;`;
  const rows = await db.getAll(command, [userId]);
  return UrlModels.coerce(rows);
}

/**
 * Updates the url with the given id.
 * @param urlModel The new url model to replace the url with the given id
 * @param userId The id of the user who created the url
 * @throws HTTPException if the url does not exist
 * @throws HTTPException if the new url is not reachable
 */
export async function updateUrl(urlModel: UrlModel, userId: string) {
  await assertIsRightUser(urlModel.id, userId);
  await assertUrlIsReachable(urlModel.url);

  const command = `
    UPDATE urls
    SET url = ?
    WHERE id = ?;`;

  await db.run(command, [urlModel.url.toString(), urlModel.id]);
  return urlModel;
}

/**
 * Deletes the url with the given id.
 * @param id The id of the url to delete
 * @param userId The id of the user who created the url
 * @throws HTTPException if the url does not exist
 */
export const deleteUrl = async (id: string, userId: string) => {
  await assertIsRightUser(id, userId);
  const command = `
    DELETE
    FROM urls
    WHERE id = ?;`;

  await db.run(command, [id]);
};

/**
 * Deletes all urls.
 */
export const deleteAllUrls = (userId: string) => {
  return db.run(
    `DELETE
     FROM urls
     WHERE user = ?;`,
    [userId]
  );
};
