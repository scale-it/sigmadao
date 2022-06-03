/* GraphQL queries */

import { quotesWrapper } from "@/constants";

/**
 * Get all dao request for postgraphile
 * @param first Similar to limit in PostreSQL. E.g first 10 entries of row after cursor pointer
 * @param after End cursor pointer
 * @param last  Similar to limit in PostreSQL. E.g last 10 entries of row before cursor pointer
 * @param before Start cursor pointer
 */
export const getAllDaoReq = (
	first: number | null,
	after: string | null,
	last: number | null,
	before: string | null
) => {
	// the cursor needs to be wrapped inside double quotes
	after = quotesWrapper(after);
	before = quotesWrapper(before);
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

/** Get start and end cursor. For page = 2 to n-1.
 * @param pageNumber Page number user is trying to visit
 * @param pageSize Number of entries to be in table in single page
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
