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
