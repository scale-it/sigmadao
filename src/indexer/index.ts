import {
	GLOBAL_STATE,
	GLOBAL_STATE_MAP_KEY,
	LOCAL_STATE,
	LOCAL_STATE_MAP_KEY,
	APPLICATION_ID,
	ASSET_ID,
	KEY_VALUE,
	APPLICATION,
	PARAMS,
	ASSETS,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import ProposalStore from "@/store/ProposalStore";
import { Key, StateValue } from "@algo-builder/algob/build/types";
import type { LogicSigAccount } from "algosdk";
import { getProposalLsig } from "../contract/dao";
import indexerClient from "../config/indexer.config";

export const searchForAssetsByName = async (
	assetName: string
): Promise<Record<string, any> | undefined> => {
	try {
		const accountInfo = await indexerClient
			.searchForAssets()
			.name(assetName)
			.do();
		return JSON.parse(JSON.stringify(accountInfo));
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export const getApplicationGlobalState = async (
	applicationId: number
): Promise<Map<string, StateValue> | undefined> => {
	try {
		// get global state of application
		const applicationInfo = await indexerClient
			.lookupApplications(applicationId)
			.do();

		const globalState = applicationInfo[APPLICATION][PARAMS][GLOBAL_STATE];
		// parse global state of DAO app to get details for UI
		const globalStateMap = await decodeStateMap(globalState);
		return globalStateMap;
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export const getAccountAppLocalState = async (
	address: string,
	applicationId: number
): Promise<Map<string, StateValue> | undefined> => {
	try {
		let localStateMap = undefined;
		// parse local state of DAO app for current user to get their details related to app for UI
		const localState = await indexerClient
			.lookupAccountAppLocalStates(address)
			.do();
		const parsedLocalState = JSON.parse(JSON.stringify(localState));

		if (parsedLocalState && parsedLocalState[LOCAL_STATE]) {
			const applicationInfo = parsedLocalState[LOCAL_STATE].find(
				(appInfo: any) => appInfo[APPLICATION_ID] === applicationId
			);
			if (applicationInfo) {
				localStateMap = await decodeStateMap(applicationInfo[KEY_VALUE]);
			}
		}

		return localStateMap;
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export const searchApplicationAndAccount = async () => {
	const daoIdStore = DaoID();
	const walletStore = WalletStore();
	const proposalStore = ProposalStore();

	// check if dao id is present or not
	if (typeof daoIdStore.dao_id === "undefined") {
		return;
	}
	const dao_id = daoIdStore.dao_id;
	const application = await getApplicationGlobalState(dao_id).catch((error) => {
		console.log(error);
		throw error;
	});

	if (application) {
		daoIdStore.global_app_state = application;
		daoIdStore.name = daoIdStore.global_app_state.get(
			GLOBAL_STATE_MAP_KEY.DaoName
		) as string;
	}

	if (walletStore.address) {
		const localStateMap = await getAccountAppLocalState(
			walletStore.address,
			dao_id
		).catch((error) => {
			console.log(error);
			throw error;
		});

		const lsig: LogicSigAccount = await getProposalLsig(
			dao_id,
			walletStore.address
		);
		proposalStore.setProposalAddr(lsig.address());
		if (daoIdStore.govt_id) {
			const availableTokens = await getGovASATokenAmount(
				walletStore.address,
				daoIdStore.govt_id
			);
			daoIdStore.available = availableTokens;
		}
		if (localStateMap) {
			daoIdStore.locked =
				(localStateMap.get(LOCAL_STATE_MAP_KEY.Deposit) as number) ?? 0;
		} else {
			daoIdStore.locked = 0;
		}
	}
};

/**
 * Check if given asset is opted in given address
 * @param address Account address
 * @param asset_id asset id
 */
export const isAssetOpted = async (
	address: string,
	asset_id: number
): Promise<boolean> => {
	try {
		let isAssetOpted = false;
		const assetInfo = await indexerClient.lookupAccountAssets(address).do();

		if (assetInfo.assets) {
			const optedAssetInfo = assetInfo.assets.find(
				(i: any) => i[ASSET_ID] === asset_id
			);
			if (optedAssetInfo) {
				isAssetOpted = true;
			}
		}
		return isAssetOpted;
	} catch (e) {
		console.error(e);
		throw e;
	}
};

/**
 * Check if given application is opted in given address
 * @param address Account address
 * @param applicationId application id
 */
export const isApplicationOpted = async (
	address: string,
	applicationId: number
): Promise<boolean> => {
	try {
		let isApplicationOpted = false;
		const applicationInfo = await indexerClient
			.lookupAccountAppLocalStates(address)
			.do();
		const parsedApplicationInfo = JSON.parse(JSON.stringify(applicationInfo));
		if (parsedApplicationInfo && parsedApplicationInfo[LOCAL_STATE]) {
			const optedApplicationInfo = applicationInfo[LOCAL_STATE].find(
				(i: any) => (i[APPLICATION_ID] = applicationId)
			);
			if (optedApplicationInfo) {
				isApplicationOpted = true;
			}
		}
		return isApplicationOpted;
	} catch (e) {
		console.error(e);
		throw e;
	}
};

export const getGovASATokenAmount = async (
	address: string,
	govtID: number
): Promise<number> => {
	try {
		const assetInfo = await indexerClient.lookupAccountAssets(address).do();
		let amount = 0;
		if (assetInfo[ASSETS]) {
			const govtAssetInfo = assetInfo[ASSETS].find(
				(i: any) => i[ASSET_ID] === govtID
			);
			if (govtAssetInfo) {
				amount = govtAssetInfo.amount;
			}
		}
		return amount;
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export async function decodeStateMap(
	state: Array<any>
): Promise<Map<Key, StateValue>> {
	const stateMap = new Map<Key, StateValue>();
	if (state) {
		for (const g of state) {
			const key = Buffer.from(g.key, "base64").toString();
			if (g.value.type === 1) {
				stateMap.set(
					key,
					Buffer.from(g.value.bytes, "base64").toString("ascii")
				);
			} else {
				stateMap.set(key, g.value.uint);
			}
		}
	}
	return stateMap;
}
