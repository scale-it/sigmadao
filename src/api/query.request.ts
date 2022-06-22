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
        startCursor
        endCursor
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

/** LookupApplications
 * @param appId Application id
 */
export const lookupApplications = (appId: number) => {
	return `query LookupApplications {
    allSigmaDaos(condition: {appId: "${appId}"}) {
      nodes {
        appParams
      }
    }
  }`;
};

/** LookupAssetByID
 * @param assetId Asset ID
 */
export const lookupAssetByID = (assetId: number) => {
	return `query LookupAssetByID {
    allAssets(condition: {index: "${assetId}"}) {
        nodes {
          params
        }
    }
  }`;
};

/** LookupAccountAssets.
 * @param addr Address
 * @param assetId Asset ID
 */
export const lookupAccountAssets = (addr: string, assetId: number) => {
	return `query LookupAccountAssets {
    allAccountAssets(
      condition: {
        assetid: "${assetId}"
        addr: "${"\\\\x" + addr}"
      }
    ) {
      nodes {
        amount
      }
    }
  }`;
};

/** lookupAccountAppLocalStates
 * @param addr Address
 * @param appId Application ID
 */
export const lookupAccountAppLocalStates = (addr: string, appId: number) => {
	return `query LookupAccountAppLocalStates {
    allAccountApps(
      condition: { addr: "${"\\\\x" + addr}", app: "${appId}" }
    ) {
      nodes {
        app
        localstate
      }
    }
  }`;
};

/** LookUpSigmaDaoByAppId
 * @param appId Application ID
 */
export const getDaoInfoByAppIdReq = (appId: number) => {
	return `query SearchByAppId {
    allSigmaDaos(condition: {appId: "${appId}"}) {
      nodes {
        appId
        appParams
        assetId
      }
    }
  }`;
};
