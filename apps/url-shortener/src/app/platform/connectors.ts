import { UrlModel, UrlModels } from "../models";
import { db } from "./db";
import { HTTPException } from "@luftschloss/server";
import { get } from "@luftschloss/client";

/**
 * Creates a new url and returns the created model.
 * @param url The url to create
 */
export const createUrl = async (url: URL): Promise<UrlModel> => {
  await assertUrlIsReachable(url);
  const id = await generateCollisionFreeId();
  const command = `INSERT INTO urls (url, id)
                   VALUES (?, ?);`;
  await db.run(command, [url.toString(), id]);
  return { url, id };
};

/**
 * Returns the url with the given id.
 * @param id The id of the url
 * @throws HTTPException if the url does not exist
 */
export async function getUrl(id: string): Promise<UrlModel> {
  await assertExists(id);

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
 */
export async function getAllUrls(): Promise<UrlModel[]> {
  const command = `SELECT *
                   FROM urls;`;
  const rows = await db.getAll(command);
  return UrlModels.coerce(rows);
}

/**
 * Updates the url with the given id.
 * @param urlModel The new url model to replace the url with the given id
 * @throws HTTPException if the url does not exist
 * @throws HTTPException if the new url is not reachable
 */
export async function updateUrl(urlModel: UrlModel) {
  await assertExists(urlModel.id);
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
 * @throws HTTPException if the url does not exist
 */
export const deleteUrl = async (id: string) => {
  await assertExists(id);
  const command = `
    DELETE
    FROM urls
    WHERE id = ?;`;

  await db.run(command, [id]);
};

/**
 * Deletes all urls.
 */
export const deleteAllUrls = () => {
  return db.run(`DELETE
                 FROM urls;`);
};

/**
 * Generates a random id using 62 alphanumeric characters.
 * This results in 916.132.832 possible ids.
 * When generating ids with a speed of 1000 hour this would result in * ~4 hours needed, in order to have a 1% probability of at least one collision.
 * (see https://zelark.github.io/nano-id-cc/) for the source of the numbers with custom alphabet and length.
 */
const generateId = (): string => {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
};

/**
 * Generates a random id, which is not already used in the database.
 * This is done by generating a random id and checking if it already exists in the database.
 * Be warned that there is a small probability of a collision because of a race condition, which is not handled here.
 * We would have to use a Semaphore for the generateCollisionFreeId function, in order to prevent this.
 */
const generateCollisionFreeId = async (): Promise<string> => {
  /**
   * Can be replaced with the following code if you want to generate numerical ids, which are shorter, but also
   * sequential. This is not recommended for a production use case, because it is easier to guess the next id.
   * This approach would scale as long as the database is not too big < 100.000 entries.
   *
   * // Join the table on itself, however join the left table on the right table + 1, thereby checking if the next highest
   * // id exists. If this is the case r.id will not be null. Now we filter for all rows where r.id is null and select the
   * // left id - 1, which is the smallest unused id.
   * const smallestId = await db.get<{ id: number }>(
   *   `SELECT (l.id - 1) as id
   *    from urls l
   *           LEFT JOIN urls r ON l.id = r.id + 1
   *    WHERE r.id IS NULL
   *      and l.id > 0 LIMIT 1;`
   * );
   *
   * if (smallestId) return smallestId.id.toString();
   *
   * const row = (await db.get<{ count: number }>(`
   *     SELECT COUNT(*) as count
   *     FROM urls;
   *   `)) ?? { count: 0 };
   * return row.count.toString();
   */

  let id: string | undefined;
  while (!id) {
    const candidate = generateId();
    const exists = await db
      .get<{ id: string }>(
        `SELECT id
         FROM urls
         WHERE id = ?`,
        [candidate]
      )
      .then(r => !!r);
    if (!exists) id = candidate;
  }
  return id;
};

/**
 * Asserts that the url with the given id exists.
 * @param id The id of the url
 * @throws HTTPException if the url does not exist
 */
const assertExists = async (id: string) => {
  const command = `
    SELECT *
    FROM urls
    WHERE id = ?;
  `;

  const exists = await db.get(command, [id]).then(r => !!r);
  if (!exists) throw new HTTPException(404, "Url not found");
};

/**
 * Asserts that the given url is reachable.
 * @param url The url to check
 * @throws HTTPException if the url is not reachable
 */
const assertUrlIsReachable = async (url: URL) => {
  await get(url, { timeout: 2000 })
    .send()
    .catch(() => {
      throw new HTTPException(400, "Url is not reachable");
    })
    .then(r => {
      if (!r.ok) throw new HTTPException(400, "URL returned a non-success status code");
    });
};
