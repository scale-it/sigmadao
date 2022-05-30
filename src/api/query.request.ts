/* GraphQL queries */
export const getAllDaoReq = (
	first: number | null,
	after: string | null,
	last: number | null,
	before: string | null
) => {
	return `
  query Daos {
    allSigmaDaos(
      first: ${first}
      after: ${after}
      before: ${before}
      last: ${last}
    ) {
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      nodes {
        appId
        assetId
        appParams
      }
    }
  }
  `;
};
