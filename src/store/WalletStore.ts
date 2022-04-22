import { defineStore } from "pinia";
import { WalletType, WalletStoreState } from "../types";
import { WebMode } from "@algo-builder/web";

export default defineStore("WalletStore", {
	state: (): WalletStoreState => {
		return {
			walletKind: WalletType.NONE,
			webMode: <WebMode>{},
			address: "",
		};
	},
	getters: {
		getWebMode(state) {
			return state.webMode
		}
	},
	actions: {
		setWalletType(walletType: WalletType) {
			this.walletKind = walletType;
		},
		setWebMode(webMode: WebMode) {
			this.webMode = webMode
		},
		setWalletAddress(address: string) {
			this.address = address;
		},
	},
});
