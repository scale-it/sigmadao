import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { reactive } from "vue";

export const APP_NOT_FOUND = "Please add DAO App ID";
export const TOKEN_NOT_FOUND = "Govt token not found";
export const WALLET_NOT_CONNECT = "Please connect to your Wallet";

export const OverallErrorCheck = () => {
	const daoIDStore = reactive(DaoID());
	const walletStore = reactive(WalletStore());

	if (typeof daoIDStore.dao_id === "undefined") {
		return APP_NOT_FOUND;
	}
	if (typeof daoIDStore.govt_id === "undefined") {
		return TOKEN_NOT_FOUND;
	}
	if (!walletStore.address.length) {
		return WALLET_NOT_CONNECT;
	}
	return "";
};
