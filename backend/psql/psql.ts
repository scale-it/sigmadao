const { Pool } = require("pg");
import {
	POSTGRES_DBNAME,
	POSTGRES_PASS,
	POSTGRES_UNAME,
	POSTGRES_HOST,
	POSTGRES_PORT,
} from "./config";

const pool = new Pool({
	user: POSTGRES_UNAME,
	host: POSTGRES_HOST,
	database: POSTGRES_DBNAME,
	password: POSTGRES_PASS,
	port: POSTGRES_PORT,
});

export default pool;
