import { defineStore } from "pinia";
import { Wallet, WalletStoreState } from "../types";

export default defineStore("WalletStore", {
	state: (): WalletStoreState => {
		return {
			walletKind: Wallet.NONE,
		};
	},
	actions: {
		setHasAlgoSigner(value: Wallet) {
			this.walletKind = value;
		},
	},
});
