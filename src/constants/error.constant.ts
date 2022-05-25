import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { message, notification } from "ant-design-vue";
import { reactive } from "vue";

export const APP_NOT_FOUND = "Please add DAO App ID";
export const TOKEN_NOT_FOUND = "Govt token not found";
export const WALLET_NOT_CONNECT = "Please connect to your Wallet";
export const DAO_ID_EMPTY = "Please select a DAO App ";

export const WALLET_CONNECTION_ERROR = (wallet: string) =>
	`Error occured while connecting with ${wallet}`;

export const NOT_OPTED_IN = "Please opt in DAO App";
export const overallErrorCheck = () => {
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

export const openErrorNotificationWithIcon = (
	message: string,
	description?: string
) => {
	notification["error"]({
		message: message,
		description: description,
		duration: 0, // to close only when user prompts close button
		onClose: () => notification.close(""),
	});
};

export const errorMessage = (key: string) => {
	message.error({ content: "Error Occured", key: key });
};

export const UNSUCCESSFUL = "Unsuccessful";

export const DAO_ID_ERROR = (daoId: number) =>
	`No Application found for Application ID: ${daoId}`;
