<template>
	<AppHeader />
	<router-view />
	<AppFooter />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WalletStore from "./store/WalletStore";
import { WalletType } from "./types";
import { MAX_WALLET_COUNT_CHECK } from "./config/app.config";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
declare var AlgoSigner: any; // eslint-disable-line

export default defineComponent({
	name: "App",
	components: { AppHeader, AppFooter },
	data() {
		return {
			walletCheckCount: 1,
		};
	},
	setup() {
		const walletStore = WalletStore();

		return {
			setWalletType: walletStore.setWalletType,
		};
	},
	mounted() {
		this.checkAlgoSigner();
	},
	methods: {
		async checkAlgoSigner() {
			if (typeof AlgoSigner !== "undefined") {
				this.setWalletType(WalletType.ALGOSIGNER);
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
