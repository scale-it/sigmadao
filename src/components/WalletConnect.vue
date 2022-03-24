<template>
	<div class="top_index">
		<a-row v-if="selectedWallet === WalletType.NONE">
			<a-col :offset="10">
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
		<a-row v-else>
			<a-space>
				<a-col v-if="walletAddress" sp>
					<div class="">
						Wallet: {{ walletAddress.substring(0, 10) }} ...
					</div></a-col
				>
				<a-col>
					<a-button @click="handleLogout"> Logout </a-button>
				</a-col>
			</a-space>
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
		};
	},
	methods: {
		async connectAlgoSigner() {
			try {
				const webMode = new WebMode(AlgoSigner, CHAIN_NAME);
				this.initializeWebMode(webMode);
				const algoSignerResponse = await AlgoSigner.connect({
					ledger: CHAIN_NAME,
				});
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
			console.error("changing wallet kind", e.key);
			if (e.key === WalletType.ALGOSIGNER) {
				this.selectedWallet = WalletType.ALGOSIGNER;
				this.connectAlgoSigner();
			} else {
				console.warn("Wallet %s not supported", e.key);
			}
		},
		handleLogout() {
			this.selectedWallet = WalletType.NONE;
			this.walletAddress = "";
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
