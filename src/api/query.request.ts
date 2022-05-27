/* GraphQL queries */
export const getAllDaoReq = (pageNumber: number, pageSize: number) => {
	return `
  query Query {
    allSigmaDaos(first: ${pageSize}, offset: ${(pageNumber - 1) * pageSize}) {
      nodes {
        appId
        appParams
        assetId
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
  
  `;
};
