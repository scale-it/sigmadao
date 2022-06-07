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
	ASSET,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import ProposalStore from "@/store/ProposalStore";
import { Key, StateValue } from "@algo-builder/algob/build/types";
import type { LogicSigAccount } from "algosdk";
import { getProposalLsig } from "../contract/dao";
import indexerClient from "../config/indexer.config";
import { convertToHex } from "@/utility";
import { SchemaType, UnknownObject } from "@/types";
import {
	executeReq,
	lookupApplications,
	lookupAssetByID,
	lookupAccountAssets,
} from "@/api";

export const getApplicationGlobalState = async (
	applicationId: number
): Promise<Map<string, StateValue> | undefined> => {
	try {
		// get global state of application
		const globalStateRes = await executeReq(lookupApplications(applicationId));
		const globalState = JSON.parse(
			globalStateRes.allSigmaDaos.nodes[0].appParams
		).dt.gd;
		return decodeAppParamsState(globalState);
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
				localStateMap = decodeStateMap(applicationInfo[KEY_VALUE]);
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
 * @param assetId asset id
 */
export const isAssetOpted = async (
	address: string,
	assetId: number
): Promise<boolean> => {
	try {
		const hexAddr = convertToHex(address);
		const assetInfo = await executeReq(lookupAccountAssets(hexAddr, assetId));
		// if greater then 0 then asset is opted.
		return assetInfo?.allAccountAssets?.nodes?.length;
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
				(appInfo: any) => (appInfo[APPLICATION_ID] = applicationId)
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
	assetId: number
): Promise<number> => {
	try {
		const hexAddr = convertToHex(address);
		const assetInfo = await executeReq(lookupAccountAssets(hexAddr, assetId));
		let amount = 0;
		if (assetInfo?.allAccountAssets?.nodes[0]?.amount) {
			amount = parseInt(assetInfo.allAccountAssets.nodes[0].amount);
		}
		return amount;
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export function decodeStateMap(state: Array<any>): Map<Key, StateValue> {
	const stateMap = new Map<Key, StateValue>();
	if (state) {
		for (const g of state) {
			const key = Buffer.from(g.key, "base64").toString();
			if (g.value.type === SchemaType.BYTES) {
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

export function decodeAppParamsState(state: any): Map<Key, StateValue> {
	const stateMap = new Map<Key, StateValue>();
	if (state) {
		for (const key in state) {
			if (state[key].at === SchemaType.BYTES) {
				stateMap.set(
					Buffer.from(key, "base64").toString("ascii"),
					Buffer.from(state[key].bs, "base64").toString("ascii")
				);
			} else {
				stateMap.set(
					Buffer.from(key, "base64").toString("ascii"),
					state[key].ui
				);
			}
		}
	}
	return stateMap;
}

export async function getAssetInformation(
	assetId: number
): Promise<UnknownObject> {
	try {
		const assetInfo = await executeReq(lookupAssetByID(assetId));
		return JSON.parse(assetInfo.allAssets.nodes[0].params);
	} catch (e) {
		console.error(e);
		throw e;
	}
}
