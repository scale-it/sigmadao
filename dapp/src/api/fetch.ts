import { getWalletConfig } from "@/utility"
export const executeReq = (query: string) => {
	const url = getWalletConfig();

	return fetch(url.backendBaseURL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			query,
		}),
	})
		.then((response) => response.json())
		.then((data) => data?.data)
		.catch((error) => error);
};

module.exports = {
	executeReq,
};
