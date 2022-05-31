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
      nodes {
        appId
        assetId
        appParams
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
  `;
};

/* Get start and end cursor
   Page = 2 to n-1
*/
export const getCursorReq = (pageNumber: number, pageSize: number) => {
	return `
  query Cursor {
    allSigmaDaos(first: ${(pageNumber - 1) * pageSize}) {
      pageInfo {
        endCursor
        startCursor
      }
    }
  }
  `;
};
