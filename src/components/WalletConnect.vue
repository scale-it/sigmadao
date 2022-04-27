<template>
	<template v-if="selectedWallet === WalletType.NONE">
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
					<a-button>
						Connect Wallet
						<DownOutlined />
					</a-button>
				</a-dropdown>
			</a-col>
		</a-row>
	</template>
	<template v-else>
		<a-row class="wallet" v-if="walletAddress">
			<a-card size="small">
				<a-row align="middle">
					<a-col :span="20">
						<a-descriptions :column="1" size="small" class="ellipsis">
							<a-descriptions-item label="Wallet">{{
								walletAddress
							}}</a-descriptions-item>
							<a-descriptions-item label="Selected Wallet">
								{{ selectedWallet }}
							</a-descriptions-item>
						</a-descriptions>
					</a-col>
					<a-col style="margin: auto">
						<a-button type="primary" @click="handleLogOut">
							<template #icon>
								<LogoutOutlined />
							</template>
						</a-button>
					</a-col>
				</a-row>
			</a-card>
		</a-row>
	</template>
</template>

<script lang="ts">
import { DownOutlined, LogoutOutlined } from "@ant-design/icons-vue";
import { CHAIN_NAME } from "../config/algosigner.config";
import { defineComponent } from "vue";
import { WalletType } from "../types/enum.types";
import { WebMode } from "@algo-builder/web";
import WalletStore from "../store/WalletStore";
import { searchForAssets } from "../indexer";
import { GOV_TOKEN_ASSET } from "../constants/constant";
import DaoID from "@/store/DaoID";
declare var AlgoSigner: any; // eslint-disable-line

export default defineComponent({
	components: {
		DownOutlined,
		LogoutOutlined,
	},
	data() {
		return {
			WalletType,
			selectedWallet: WalletType.NONE,
			walletAddress: "",
		};
	},
	mounted() {
		searchForAssets(GOV_TOKEN_ASSET)
			.then((response) => {
				if (response && response.assets && response.assets.length) {
					let assetLength: number = response.assets.length;
					if (response.assets[assetLength - 1].params) {
						DaoID().setGovtId(response.assets[assetLength - 1].index);
						console.log(
							"Gov Token Info:",
							response.assets[assetLength - 1].params
						);
					}
				} else {
					console.warn("gov-token not found");
				}
			})
			.catch((error) => {
				console.log(error);
			});
	},
	setup() {
		const walletStore = WalletStore();
		return {
			initializeWebMode: walletStore.setWebMode,
			setWalletType: walletStore.setWalletType,
			setAddress: walletStore.setWalletAddress,
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
				this.updateWallet(userAccount[0].address);
			}
		},
		updateWallet(address: string) {
			this.walletAddress = address;
			this.setAddress(address);
		},
		// eslint-disable-next-line
		handleMenuClick(e: any) {
			console.log("changing wallet kind", e.key);
			this.connectWallet(e.key);
		},
		handleLogOut() {
			console.log("Wallet Disconnected");
			this.updateWallet("");
			DaoID().handleLogOut();
			this.setWalletType(WalletType.NONE);
			this.selectedWallet = WalletType.NONE;
		},
	},
});
</script>
