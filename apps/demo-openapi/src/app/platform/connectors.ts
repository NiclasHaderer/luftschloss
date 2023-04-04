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
  return UrlModel.validate(row);
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

const getSmallestUnusedId = async (): Promise<number> => {
  const ids = await getAllUrls();

  for (let i = 0; i < ids.length; i++) {
    if (ids[i].id !== i) {
      return i;
    }
  }
  return ids.length;
};

const assertExists = async (id: number) => {
  const command = `
    SELECT *
    FROM urls
    WHERE id = ?
    LIMIT 1;
  `;

  const exists = await db.get(command, [id]).then(r => !!r);
  if (!exists) throw new HTTPException(404, "Url not found");
};
