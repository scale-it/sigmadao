import { CHAIN_NAME } from "@/config/algosigner.config";
import {
	GLOBAL_STATE,
	GLOBAL_STATE_MAP_KEY,
	LOCAL_STATE,
	LOCAL_STATE_MAP_KEY,
} from "@/constants/constant";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import ProposalStore from "@/store/ProposalStore";
import {
	Key,
	StateValue,
	AccountAddress,
} from "@algo-builder/algob/build/types";
import type { LogicSigAccount } from "algosdk";
import { getProposalLsig } from "../contract/dao";
declare var AlgoSigner: any; // eslint-disable-line

export const searchForAssets = async (
	tokenName: string
): Promise<Record<string, any> | undefined> => {
	try {
		const accountInfo = await AlgoSigner.indexer({
			ledger: CHAIN_NAME,
			path: `/v2/assets?name=${tokenName}`,
		});
		return JSON.parse(JSON.stringify(accountInfo));
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export const searchForApplication = async (
	application_id: number
): Promise<Map<string, StateValue> | undefined> => {
	try {
		const applicationInfo = await AlgoSigner.indexer({
			ledger: CHAIN_NAME,
			path: `/v2/applications/${application_id}`,
		});

		const creator = applicationInfo.application.params.creator;
		const globalStateMap = await readAppState(
			GLOBAL_STATE,
			creator,
			application_id
		);
		return globalStateMap;
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export const searchForAccount = async (
	address: string,
	application_id: number
): Promise<{
	total_amount: number;
	localStateMap: Map<string, StateValue> | undefined;
}> => {
	try {
		const accountInfo = await AlgoSigner.indexer({
			ledger: CHAIN_NAME,
			path: `/v2/accounts/${address}`,
		});
		console.log(
			"Information for Account: " + JSON.stringify(accountInfo, undefined, 2)
		);
		const localStateMap = await readAppState(
			LOCAL_STATE,
			address,
			application_id
		);
		const total_amount = accountInfo.account.amount;
		return { total_amount, localStateMap };
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export async function readAppState(
	stateType: string,
	account: AccountAddress,
	appID: number
): Promise<Map<Key, StateValue> | undefined> {
	const accountInfoResponse = await AlgoSigner.algod({
		ledger: CHAIN_NAME,
		path: `/v2/accounts/${account}`,
	});

	for (const app of accountInfoResponse[stateType]) {
		if (app.id === appID) {
			const stateMap = new Map<Key, StateValue>();
			const appKey =
				stateType === LOCAL_STATE
					? app[`key-value`]
					: app.params["global-state"];
			for (const g of appKey) {
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
			return stateMap;
		}
	}
	return undefined;
}

export const searchApplicationAndAccount = async () => {
	const daoIdStore = DaoID();
	const walletStore = WalletStore();
	const proposalStore = ProposalStore();

	const dao_id = daoIdStore.dao_id as number;
	const application = await searchForApplication(dao_id).catch((error) => {
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
		const account = await searchForAccount(walletStore.address, dao_id).catch(
			(error) => {
				console.log(error);
				throw error;
			}
		);
		const lsig: LogicSigAccount = await getProposalLsig(
			dao_id,
			walletStore.address
		);
		proposalStore.setProposalAddr(lsig.address());

		if (account && account.localStateMap) {
			daoIdStore.locked =
				(account.localStateMap.get(LOCAL_STATE_MAP_KEY.Deposit) as number) ?? 0;
		} else {
			daoIdStore.locked = 0;
		}
		daoIdStore.available = account.total_amount - daoIdStore.locked;
	}
};

/**
 * Check if given asset is opted in given address
 * @param addres Account address
 * @param asset_id asset id
 */
export const isAssetOpted = async (address: string, asset_id: number) => {
	try {
		const optedAssetInfo = await AlgoSigner.indexer({
			ledger: CHAIN_NAME,
			path: `/v2/accounts/${address}/assets`,
		});
		const parsedOptedAssetInfo = JSON.parse(JSON.stringify(optedAssetInfo));
		if (parsedOptedAssetInfo && parsedOptedAssetInfo.assets) {
			const isGivenAssetOpted = parsedOptedAssetInfo.assets.find(
				(element: any) => element["asset-id"] === asset_id
			);
			if (isGivenAssetOpted) return true;
		}
		return false;
	} catch (e) {
		console.error(e);
		throw e;
	}
};

export const isApplicationOpted = async (
	address: string,
	application_id: number
) => {
	try {
		const optedApplicationInfo = await AlgoSigner.indexer({
			ledger: CHAIN_NAME,
			path: `/v2/accounts/${address}/apps-local-state`,
		});
		const parsedOptedApplicationInfo = JSON.parse(
			JSON.stringify(optedApplicationInfo)
		);
		if (
			parsedOptedApplicationInfo &&
			parsedOptedApplicationInfo["apps-local-states"]
		) {
			const isGivenApplicationOpted = parsedOptedApplicationInfo[
				"apps-local-states"
			].find((element: any) => element["id"] === application_id);
			if (isGivenApplicationOpted) return true;
		}
		return false;
	} catch (e) {
		console.error(e);
		throw e;
	}
};
