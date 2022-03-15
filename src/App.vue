<template>
	<router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WalletStore from "./store/WalletStore";
import { Wallet } from "./types";
import { MAX_WALLET_COUNT_CHECK } from "./config/app.config";
declare var AlgoSigner: any; // eslint-disable-line

export default defineComponent({
	name: "App",
	data() {
		return {
			walletCheckCount: 1,
		};
	},
	setup() {
		const walletStore = WalletStore();

		return {
			setHasAlgoSigner: walletStore.setHasAlgoSigner,
		};
	},
	mounted() {
		this.checkAlgoSigner();
	},
	methods: {
		async checkAlgoSigner() {
			if (typeof AlgoSigner !== "undefined") {
				this.setHasAlgoSigner(Wallet.ALGOSIGNER);
				await AlgoSigner.connect();
			} else {
				// maximum number of times to check wallet
				if (this.walletCheckCount <= MAX_WALLET_COUNT_CHECK) {
					this.walletCheckCount++;
					setTimeout(() => this.checkAlgoSigner(), 500);
				}
			}
		},
	},
});
</script>
