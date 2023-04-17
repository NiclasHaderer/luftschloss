import { db } from "./db";

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
export const generateCollisionFreeId = async (): Promise<string> => {
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
