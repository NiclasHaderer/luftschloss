import { UrlModel, UrlModels } from "../models";
import { db } from "./db";
import { HTTPException } from "@luftschloss/server";
import { get } from "@luftschloss/client";

export const createUrl = async (url: URL): Promise<UrlModel> => {
  await assertUrlIsReachable(url);
  const id = await generateCollisionFreeId();
  const command = `INSERT INTO urls (url, id)
                   VALUES (?, ?);`;
  await db.run(command, [url.toString(), id]);
  return { url, id };
};

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

export async function getAllUrls(): Promise<UrlModel[]> {
  const command = `SELECT *
                   FROM urls;`;
  const rows = await db.getAll(command);
  return UrlModels.coerce(rows);
}

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

export const deleteUrl = async (id: string) => {
  await assertExists(id);
  const command = `
    DELETE
    FROM urls
    WHERE id = ?;`;

  await db.run(command, [id]);
};

export const deleteAllUrls = () => {
  return db.run(`DELETE FROM urls;`);
};

const generateId = (): string => {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
};

const generateCollisionFreeId = async (): Promise<string> => {
  let id: string | undefined;
  while (!id) {
    const candidate = generateId();
    const exists = await db.get<{ id: string }>(`SELECT id FROM urls WHERE id = ?`, [candidate]).then(r => !!r);
    if (!exists) id = candidate;
  }
  return id;
};

const assertExists = async (id: string) => {
  const command = `
    SELECT *
    FROM urls
    WHERE id = ?;
  `;

  const exists = await db.get(command, [id]).then(r => !!r);
  if (!exists) throw new HTTPException(404, "Url not found");
};

const assertUrlIsReachable = async (url: URL) => {
  await get(url, { timeout: 2000 })
    .send()
    .catch(() => {
      throw new HTTPException(400, "Url is not reachable");
    })
    .then(r => {
      if (!r.ok) throw new HTTPException(400, "Url is not reachable");
    });
};
