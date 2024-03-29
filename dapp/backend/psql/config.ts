// PostgreSQL parameters to pass to the URL origin
const POSTGRES_UNAME = process.env.POSTGRES_UNAME || "sigma_dao_user";
const POSTGRES_DBNAME = process.env.POSTGRES_DBNAME || "pgdb";
const POSTGRES_PASS = process.env.POSTGRES_PASS || "SigmaDao@1234";
const POSTGRES_HOST = process.env.POSTGRES_HOST || "localhost";
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT || "5432");

// Concatenate the origin URL from the PostgreSQL parameters
export const dbUrl = `postgres://${POSTGRES_UNAME}:${POSTGRES_PASS}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DBNAME}`;
