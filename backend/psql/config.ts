// PostgreSQL parameters to pass to the URL origin
const POSTGRES_UNAME = process.env.POSTGRES_UNAME || "algorand";
const POSTGRES_DBNAME = process.env.POSTGRES_DBNAME || "pgdb";
const POSTGRES_PASS = process.env.POSTGRES_PASS || "indexer";
const POSTGRES_HOST = process.env.POSTGRES_HOST || "localhost";
const POSTGRES_PORT = process.env.POSTGRES_PORT || 5432;

// Concatenate the origin URL from the PostgreSQL parameters
export const dbUrl = `postgres://${POSTGRES_UNAME}:${POSTGRES_PASS}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DBNAME}`;
