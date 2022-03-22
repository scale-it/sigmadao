<template>
	<div class="top_index">
		<a-row>
			<a-col>
				<a-dropdown>
					<template #overlay>
						<a-menu @click="handleMenuClick">
							<a-menu-item :key="WalletType.ALGOSIGNER">
								Algosigner
							</a-menu-item>
						</a-menu>
					</template>
					<a-button style="margin-bottom: 10px">
						{{ text }}
						<DownOutlined />
					</a-button>
				</a-dropdown>
			</a-col>
		</a-row>
		<a-row>
			<a-col v-if="walletAddress">Address: {{ walletAddress }}</a-col>
		</a-row>
	</div>
</template>

<script lang="ts">
import { DownOutlined } from "@ant-design/icons-vue";
import { CHAIN_NAME } from "../config/algosigner.config";
import { defineComponent } from "vue";
import { WalletType } from "../types/enum.types";
import { WebMode } from "@algo-builder/web";
import WalletStore from "../store/WalletStore";
declare var AlgoSigner: any; // eslint-disable-line

export default defineComponent({
	components: {
		DownOutlined,
	},
	data() {
		return {
			walletAddress: "",
			text: "Connect Wallet",
			selectedWallet: WalletType.NONE,
			WalletType,
		};
	},
	setup() {
		const walletStore = WalletStore();
		return {
			initializeWebMode: walletStore.setWebMode,
			setWalletType: walletStore.setWalletType,
		};
	},
	methods: {
		connectWallet(walletType: WalletType) {
			switch (walletType) {
				case WalletType.ALGOSIGNER:
					this.connectAlgoSigner();
					break;
				default:
					console.warn("Wallet %s not supported", walletType);
			}
		},
		async connectAlgoSigner() {
			try {
				const webMode = new WebMode(AlgoSigner, CHAIN_NAME);
				this.initializeWebMode(webMode);
				const algoSignerResponse = await AlgoSigner.connect({
					ledger: CHAIN_NAME,
				});
				this.setWalletType(WalletType.ALGOSIGNER);
				this.selectedWallet = WalletType.ALGOSIGNER;
				console.log("Connected to AlgoSigner:", algoSignerResponse);
				await this.getUserAccount();
			} catch (e) {
				console.error(e);
			}
		},
		async getUserAccount() {
			const userAccount = await AlgoSigner.accounts({
				ledger: CHAIN_NAME,
			});
			if (userAccount && userAccount.length) {
				this.walletAddress = userAccount[0].address;
				this.text = "AlgoSigner";
			}
		},
		handleMenuClick(e: any) {
			console.log("changing wallet kind", e.key);
			this.connectWallet(e.key);
		},
	},
});
</script>

<style scoped>
.top_index {
	z-index: 99999;
	background-color: white;
}
</style>
