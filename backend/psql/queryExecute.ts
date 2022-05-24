import pool from "./psql";

export const executeQuery = (query: string) => {
	return pool.query(query);
};
