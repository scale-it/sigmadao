import { getWalletConfig } from "@/utility";
import algosdk from "algosdk";

const token =
	process.env.VUE_APP_ALGOSDK_TOKEN ||
	"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const server = process.env.VUE_APP_ALGOSDK_URL || "http://localhost";
const port = parseInt(process.env.VUE_APP_ALGOSDK_PORT || "4001");

const algodClient = () => {
	const walletConfig = getWalletConfig();
	return new algosdk.Algodv2(
		walletConfig.token,
		walletConfig.server,
		walletConfig.port
	);
};

export { token, server, port, algodClient };
