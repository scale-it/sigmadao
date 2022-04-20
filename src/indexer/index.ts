import { CHAIN_NAME } from "@/config/algosigner.config";
import { GLOBAL_STATE, LOCAL_STATE } from "@/constants/constant";
import {
	Key,
	StateValue,
	AccountAddress,
} from "@algo-builder/algob/build/types";
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
