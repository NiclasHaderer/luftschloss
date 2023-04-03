import { Database } from "sqlite3";
import { UrlModelDecoded } from "../models";

// Connector to the SQLite database, manages the connection and the queries to the database as well as
// the creation of the database and corresponding tables if they do not exist yet.

// The name of the database file as well as the name of the table
const DB_NAME = "url_shortener.db";
const URL_TABLE_NAME = "url";

// The keys of the URL table
const URL_TABLE_KEY_ID = "id";
const URL_TABLE_KEY_URL = "url";

export const db = connect();

function connect(): Database {
  const db: Database = new Database(DB_NAME);
  create_url_table_if_not_exist(db);
  return db;
}

function create_url_table_if_not_exist(db: Database) {
  const command = `
    CREATE TABLE IF NOT EXISTS ${URL_TABLE_NAME}
    (
      ${URL_TABLE_KEY_ID}
      INTEGER
      PRIMARY
      KEY,
      ${URL_TABLE_KEY_URL}
      TEXT
      NOT
      NULL
    );`;
  db.run(command);
}

export function addUrl(urlModel: UrlModelDecoded) {
  const command = `
    INSERT INTO ${URL_TABLE_NAME}
      (${URL_TABLE_KEY_URL}, ${URL_TABLE_KEY_ID})
    VALUES (?, ?);`;

  db.run(command, urlModel.url, urlModel.id);
}

export async function getUrl(id: number): Promise<UrlModelDecoded> {
  const command = `
    SELECT *
    FROM ${URL_TABLE_NAME}
    WHERE ${URL_TABLE_KEY_ID} = ? LIMIT 1;
  `;

  const row = await new Promise((resolve, reject) => {
    db.get(command, id, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });

  return UrlModelDecoded.validate(row);
}

export async function getAllUrls(): Promise<UrlModelDecoded[]> {
  const command = `
    SELECT *
    FROM ${URL_TABLE_NAME};`;

  const rows = await new Promise((resolve, reject) => {
    db.get(command, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });

  // parse the rows to UrlModelDecoded
  const urlModels: UrlModelDecoded[] = [];
  // check if the rows are an array to iterate over it
  if (Array.isArray(rows)) {
    for (const row of rows) {
      urlModels.push(UrlModelDecoded.validate(row));
    }
  }

  return urlModels;
}

export async function updateUrl(id: number, urlModel: UrlModelDecoded) {
  const command = `
    UPDATE ${URL_TABLE_NAME}
    SET ${URL_TABLE_KEY_URL} = ?
    WHERE ${URL_TABLE_KEY_ID} = ?;`;

  db.run(command, urlModel.url, id);
}

export async function deleteUrl(id: number) {
  const command = `
    DELETE
    FROM ${URL_TABLE_NAME}
    WHERE ${URL_TABLE_KEY_ID} = ?;`;

  db.run(command, id);
}
