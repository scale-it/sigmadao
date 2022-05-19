import pool from "./psql";
import { QUERY_GET_ALL_DAOS } from "./query";

export const executeGetAllDaos = () => {
	return pool.query(QUERY_GET_ALL_DAOS);
};
