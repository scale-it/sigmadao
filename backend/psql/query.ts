export const QUERY_GET_DAOS_COUNT = "SELECT COUNT(*) FROM sigma_daos";

/**
 * Paginated query to fetch only the required information from database instead of all
 * @param pageNumber Current page number to fetch data for.
 * @param pageSize Number of data to show in single page/fetch.
 */
export const getPaginatedQuery = (pageNumber: number, pageSize: number) =>
	`SELECT * FROM sigma_daos OFFSET ((${pageNumber}-1)*${pageSize}) ROWS FETCH NEXT ${pageSize} ROWS ONLY;`;
