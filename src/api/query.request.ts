/* GraphQL queries */
export const ALL_DAOS_REQ = (pageNumber: number, pageSize: number) => {
	return `
    query {
      DaoAndPage(pageNumber: ${pageNumber}, pageSize: ${pageSize}) {
        Daos {
          app_id
          app_params
          asset_id
        }
      pageInfo {
        hasPrev
        hasNext
        totalDaos
      }
      }
    }
  `;
};
