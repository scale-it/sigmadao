import { defineStore } from "pinia";
import {
	WalletType,
	WalletStoreState,
	NetworkTypes,
	WebModeTypes,
} from "@/types";

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
		},
		setNetworkTypes(network: NetworkTypes) {
			console.log("Network Changed: ", network);
			this.network = network;
		},
	},
});
