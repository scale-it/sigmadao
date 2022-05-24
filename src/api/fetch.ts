import { BACKEND_URL } from "./constants";

export const executeReq = (query: string) => {
	return fetch(BACKEND_URL, {
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
