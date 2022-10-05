import dotenv from 'dotenv';
import { Client, types } from 'pg';

dotenv.config();

types.setTypeParser(1082, function (stringValue) {
  return stringValue;  //1082 for date type
});

const connectionString = process.env.DATABASE_URL;
const db = new Client({ connectionString });

const init = async () => {
  await db.connect();
}

export { db, init };
