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
