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
	actions: {
		setWalletType(walletType: WalletType) {
			this.walletKind = walletType;
		},
		setWebMode(webMode: WebMode) {
			this.webMode = webMode;
			console.log("WebMode Initialized", webMode);
		},
		setWalletAddress(address: string) {
			this.address = address;
		},
	},
});
