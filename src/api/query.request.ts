/* GraphQL queries */
export const getAllDaoReq = (pageNumber: number, pageSize: number) => {
	return `
    query {
      DaoAndPage(pageNumber: ${pageNumber}, pageSize: ${pageSize}) {
        Daos {
          app_id
          app_params
          asset_id
        }
      PageInfo {
        hasPrev
        hasNext
        totalDaos
      }
      }
    }
  `;
};
