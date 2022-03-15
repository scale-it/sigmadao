import { defineStore } from "pinia";
import { Wallet, WalletStoreState } from "../types";
import { WebMode } from "@algo-builder/web";

export default defineStore("WalletStore", {
	state: (): WalletStoreState => {
		return {
			walletKind: Wallet.NONE,
			webMode: <WebMode>{},
		};
	},
	actions: {
		setHasAlgoSigner(value: Wallet) {
			this.walletKind = value;
		},
		setWebMode(value: WebMode) {
			console.log("WebMode Initialized", value);
		},
	},
});
