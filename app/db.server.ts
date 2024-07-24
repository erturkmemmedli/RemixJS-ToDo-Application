import pgPromise from 'pg-promise';
import { Pool } from 'pg';

const db = pgPromise()({
  host: 'localhost',
  port: 5432,
  database: 'testdb',
  user: 'arturk',
  password: '123',
});

export { db };
