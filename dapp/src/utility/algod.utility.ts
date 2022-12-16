import { types } from "@algo-builder/web";
import { algodClient, port, server, token } from "@/config/algob.config";
import { BACKEND_BASE_URL, EncodingType, NetworkConfig, NetworkTypes } from "@/types";
import algosdk from "algosdk";
import { toRaw } from "vue";
import { BETA_NET_URL, MAIN_NET_URL, TEST_NET_URL } from "@/constants";
import WalletStore from "@/store/WalletStore";
import base32 from "hi-base32";

export const fundAmount = async (
	from: string,
	to: string,
	amount: number,
	webMode: any // eslint-disable-line
) => {
	const txParams: types.ExecParams[] = [
		{
			type: types.TransactionType.TransferAlgo,
			sign: types.SignType.SecretKey,
			fromAccount: {
				addr: from,
				sk: new Uint8Array(0),
			},
			toAccountAddr: to,
			amountMicroAlgos: amount,
			payFlags: { totalFee: 1000 },
		},
	];
	const response = await toRaw(webMode).executeTx(txParams);
	console.log("Funded: ", response);
};

export const compileSignature = async (proposalSrc: string) => {
	const response = await algodClient().compile(proposalSrc).do();
	if (!response["hash"]) {
		throw Error();
	}
	const program = new Uint8Array(Buffer.from(response["result"], "base64"));
	return new algosdk.LogicSigAccount(program);
};

export const compileToUnit8Array = async (appProgram: string) => {
	const response = await algodClient().compile(appProgram).do();
	return new Uint8Array(Buffer.from(response["result"], "base64"));
};

export const optInToAppUsingSecretKey = async (
	from: string,
	appID: number,
	webMode: any // eslint-disable-line
) => {
	const execParam: types.ExecParams = {
		type: types.TransactionType.OptInToApp,
		sign: types.SignType.SecretKey,
		fromAccount: {
			addr: from,
			sk: new Uint8Array(0),
		},
		appID: appID,
		payFlags: { totalFee: 1000 },
	};
	try {
		const response = await toRaw(webMode).executeTx([execParam]);
		console.log(response);
	} catch (error) {
		console.error("Transaction Failed", error);
		throw error;
	}
};

/**
 * Description : converts string into buffer as per encoding type
 * @param s : string to be converted
 * @param encoding : encoding type
 */
const convertToBuffer = (s: string, encoding?: EncodingType): Buffer => {
	switch (encoding) {
		case EncodingType.BASE64: {
			return Buffer.from(s, "base64");
		}
		case EncodingType.BASE32: {
			return Buffer.from(base32.decode(s));
		}
		case EncodingType.HEX: {
			return Buffer.from(s, "hex");
		}
		case EncodingType.UTF8: {
			return Buffer.from(s);
		}
		default: {
			// default encoding (utf-8)
			return Buffer.from(s);
		}
	}
};

export const convertToHex = (address: string) => {
	const pk = algosdk.decodeAddress(address);
	return Buffer.from(pk.publicKey).toString("hex");
};

export const escapedHexAddress = (address: string) => {
	return escape(address).substring(4);
};

export const convertHexToAlgorandAddr = (hex: string) => {
	try {
		const escapedHexAddr = escapedHexAddress(hex);
		return algosdk.encodeAddress(
			convertToBuffer(escapedHexAddr, EncodingType.HEX)
		);
	} catch (error) {
		console.log(error);
	}
};

export function getAlgodNetworkConfig(
	networkType: NetworkTypes
): NetworkConfig {
	switch (networkType) {
		case NetworkTypes.MAIN_NET:
			return {
				token: "",
				server: MAIN_NET_URL,
				port: "",
				backendBaseURL: BACKEND_BASE_URL.MAIN_NET
			};
		case NetworkTypes.TEST_NET:
			return {
				token: "",
				server: TEST_NET_URL,
				port: "",
				backendBaseURL: BACKEND_BASE_URL.TEST_NET
			};
		case NetworkTypes.BETA_NET:
			return {
				token: "",
				server: BETA_NET_URL,
				port: "",
				backendBaseURL: BACKEND_BASE_URL.BETA_NET
			};
		case NetworkTypes.PRIVATE_NET:
			return {
				token: token,
				server: server,
				port: port,
				backendBaseURL: BACKEND_BASE_URL.PRIVATE_NET
			};
		default:
			return {
				token: "",
				server: "",
				port: "",
				backendBaseURL: ""
			};
	}
}

export const getWalletConfig = (): NetworkConfig => {
	const walletStore = WalletStore();
	return getAlgodNetworkConfig(walletStore.network);
};
