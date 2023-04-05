import { UrlModel, UrlModels } from "../models";
import { db } from "./db";
import { HTTPException } from "@luftschloss/server";

export const createUrl = async (url: URL): Promise<UrlModel> => {
  const id = await getSmallestUnusedId();
  const command = `INSERT INTO urls (url, id)
                   VALUES (?, ?);`;
  await db.run(command, [url.toString(), id]);
  return { url, id };
};

export async function getUrl(id: number): Promise<UrlModel> {
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

export async function getAllUrls(): Promise<UrlModel[]> {
  const command = `SELECT *
                   FROM urls;`;
  const rows = await db.getAll(command);
  return UrlModels.coerce(rows);
}

export async function updateUrl(urlModel: UrlModel) {
  await assertExists(urlModel.id);

  const command = `
    UPDATE urls
    SET url = ?
    WHERE id = ?;`;

  await db.run(command, [urlModel.url.toString(), urlModel.id]);
  return urlModel;
}

export const deleteUrl = async (id: number) => {
  await assertExists(id);
  const command = `
    DELETE
    FROM urls
    WHERE id = ?;`;

  await db.run(command, [id]);
};

const getTotalUrls = async (): Promise<number> => {
  const command = `
    SELECT COUNT(*) as count
    FROM urls;
  `;
  const row = (await db.get<{ count: number }>(command)) ?? { count: 0 };
  return row.count;
};

const getSmallestUnusedId = async (): Promise<number> => {
  // Join the table on itself, however join the left table on the right table + 1, thereby checking if the next highest
  // id exists. If this is the case r.id will not be null. Now we filter for all rows where r.id is null and select the
  // left id - 1, which is the smallest unused id.
  const smallestId = await db.get<{ id: number }>(
    `SELECT (l.id - 1) as id
     from urls l
            LEFT JOIN urls r ON l.id = r.id + 1
     WHERE r.id IS NULL
       and l.id > 0
     LIMIT 1;`
  );

  if (smallestId) return smallestId.id;
  return await getTotalUrls();
};

const assertExists = async (id: number) => {
  const command = `
    SELECT *
    FROM urls
    WHERE id = ?;
  `;

  const exists = await db.get(command, [id]).then(r => !!r);
  if (!exists) throw new HTTPException(404, "Url not found");
};
