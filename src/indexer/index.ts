import algodClient from "@/config/algob.config";
import {
	Key,
	StateValue,
	AccountAddress,
} from "@algo-builder/algob/build/types";
import indexerClient from "../config/indexer.config";

export const searchForAssets = async (tokenName: string) => {
	try {
		const accountInfo = await indexerClient
			.searchForAssets()
			.name(tokenName)
			.do();
		return JSON.parse(JSON.stringify(accountInfo));
	} catch (e) {
		console.log(e);
	}
};

export const searchForApplication = async (application_id: number) => {
	try {
		const applicationInfo = await indexerClient
			.lookupApplications(application_id)
			.do();

		const creator = applicationInfo.application.params.creator;
		const globalState = await readAppGlobalState(creator, application_id);
		return globalState;
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export const searchForAccount = async (
	address: string,
	application_id: number
) => {
	try {
		const accountInfo = await indexerClient.lookupAccountByID(address).do();
		console.log(
			"Information for Account: " + JSON.stringify(accountInfo, undefined, 2)
		);
		const localStateMap = await readAppLocalState(address, application_id);
		const total_amount = accountInfo.account.amount;
		return { total_amount, localStateMap };
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export async function readAppGlobalState(
	creator: AccountAddress,
	appID: number
): Promise<Map<Key, StateValue> | undefined> {
	const accountInfoResponse = await algodClient
		.accountInformation(creator)
		.do();
	for (const app of accountInfoResponse["created-apps"]) {
		if (app.id === appID) {
			const globalStateMap = new Map<Key, StateValue>();
			for (const g of app.params["global-state"]) {
				const key = Buffer.from(g.key, "base64").toString();
				if (g.value.type === 1) {
					globalStateMap.set(key, g.value.bytes);
				} else {
					globalStateMap.set(key, g.value.uint);
				}
			}
			return globalStateMap;
		}
	}
	return undefined;
}

export async function readAppLocalState(
	account: AccountAddress,
	appID: number
): Promise<Map<Key, StateValue> | undefined> {
	const accountInfoResponse = await algodClient
		.accountInformation(account)
		.do();
	for (const app of accountInfoResponse["apps-local-state"]) {
		if (app.id === appID) {
			const localStateMap = new Map<Key, StateValue>();
			for (const g of app[`key-value`]) {
				const key = Buffer.from(g.key, "base64").toString();
				if (g.value.type === 1) {
					localStateMap.set(key, g.value.bytes);
				} else {
					localStateMap.set(key, g.value.uint);
				}
			}
			return localStateMap;
		}
	}
	return undefined;
}
