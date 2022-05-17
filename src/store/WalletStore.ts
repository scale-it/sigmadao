import { defineStore } from "pinia";
import {
	WalletType,
	WalletStoreState,
	NetworkTypes,
	WebModeTypes,
} from "@/types";
import { isApplicationOpted } from "@/indexer";
import DaoID from "./DaoID";
import {
	daoAppMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
} from "@/constants";

export default defineStore("WalletStore", {
	state: (): WalletStoreState => {
		return {
			walletKind: WalletType.NONE,
			webMode: <WebModeTypes>{},
			address: "",
			network: NetworkTypes.NONE,
		};
	},
	getters: {
		getWebMode(state) {
			return state.webMode;
		},
	},
	actions: {
		setWalletType(walletType: WalletType) {
			this.walletKind = walletType;
		},
		setWebMode(webMode: WebModeTypes) {
			this.webMode = webMode;
			console.log("WebMode Initialized", webMode);
		},
		setWalletAddress(address: string) {
			this.address = address;
			const daoIDStore = DaoID();
			// updates application opt in status whenever address is changed
			if (this.address.length && daoIDStore.dao_id) {
				isApplicationOpted(this.address, daoIDStore.dao_id)
					.then((appIsOptedIn: boolean) => {
						daoIDStore.show_opt_in = !appIsOptedIn;
						if (appIsOptedIn) {
							openSuccessNotificationWithIcon(daoAppMessage.ALREADY_OPT_IN);
						}
					})
					.catch((error) =>
						openErrorNotificationWithIcon(
							daoAppMessage.UNSUCCESFUL,
							error.message
						)
					);
			}
		},
		setNetworkTypes(network: NetworkTypes) {
			console.log("Network Changed: ", network);
			this.network = network;
		},
	},
});
