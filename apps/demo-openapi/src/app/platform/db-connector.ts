import { Database } from "sqlite3";

// Connector to the SQLite database, manages the connection and the queries to the database as well as
// the creation of the database and corresponding tables if they do not exist yet.

// The name of the database file as well as the name of the table
const DB_NAME = "url_shortener.db";
const URL_TABLE_NAME = "url";

// The keys of the URL table
const URL_TABLE_ID = "id";
const URL_TABLE_URL = "url";

export async function connect() {
  const db = new Database(DB_NAME);
  create_url_table_if_not_exist(db);
}

function create_url_table_if_not_exist(db: Database) {
  const command = `
    CREATE TABLE IF NOT EXISTS ${URL_TABLE_NAME} (
      ${URL_TABLE_ID} INTEGER PRIMARY KEY,
      ${URL_TABLE_URL} TEXT NOT NULL
    );`;

  db.run(command);
}
