import { getWalletConfig } from "@/utility";
import algosdk from "algosdk";

const token =
	process.env.ALGOSDK_TOKEN ||
	"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const server = process.env.ALGOSDK_URL || "http://localhost";
const port = process.env.ALGOSDK_PORT || 4001;

const algodClient = () => {
	const walletConfig = getWalletConfig();
	return new algosdk.Algodv2(
		walletConfig.token,
		walletConfig.server,
		walletConfig.port
	);
};

export { token, server, port, algodClient };
