<template>
	<template v-if="!walletAddress">
		<a-row :gutter="16">
			<a-col>
				<a-dropdown>
					<template #overlay>
						<a-menu @click="handleNetworkConnect">
							<a-menu-item :key="NetworkTypes.MAIN_NET"> MainNet </a-menu-item>
							<a-menu-item :key="NetworkTypes.TEST_NET"> TestNet </a-menu-item>
							<a-menu-item :key="NetworkTypes.BETA_NET"> BetaNet </a-menu-item>
							<!-- only for testing -->
							<a-menu-item :key="NetworkTypes.PRIVATE_NET">
								PrivateNet
							</a-menu-item>
						</a-menu>
					</template>
					<a-button>
						<span v-if="selectedNetwork === NetworkTypes.NONE">
							Select Network</span
						>
						<span v-else>Selected Network : {{ selectedNetwork }}</span>
						<DownOutlined />
					</a-button>
				</a-dropdown>
			</a-col>

			<a-col>
				<a-dropdown>
					<template #overlay>
						<a-menu @click="handleWalletConnect">
							<a-menu-item :key="WalletType.ALGOSIGNER">
								Algosigner
							</a-menu-item>
							<a-menu-item :key="WalletType.MY_ALGO">
								MyAlgo Wallet
							</a-menu-item>
							<a-menu-item :key="WalletType.WALLET_CONNECT">
								Wallet Connect
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
		<a-row class="wallet">
			<a-card size="small">
				<a-row align="middle">
					<span>
						<a-typography-text strong>Address: </a-typography-text>
						<a-typography-link :copyable="{ text: walletAddress }">
							<a-tooltip>
								<template #title>{{ walletAddress }}</template>
								{{ getTruncatedAddress(walletAddress) }}
							</a-tooltip>
						</a-typography-link>
					</span>
					<a-row type="flex" style="width: 100%">
						<a-col :flex="1">
							<span style="margin-top: 5px">
								<a-typography-text strong>Wallet: </a-typography-text>
								<a-typography-link>{{ selectedWallet }}</a-typography-link>
							</span>
						</a-col>
						<a-col>
							<a-dropdown v-if="selectedWallet === WalletType.ALGOSIGNER">
								<template #overlay>
									<a-menu @click="handleAddressSwitch">
										<a-menu-item v-for="addr in walletAddresses" :key="addr">
											{{ addr }}
										</a-menu-item>
									</a-menu>
								</template>
								<a-button>
									<span>{{ getTruncatedAddress(walletAddress) }}</span>
									<DownOutlined />
								</a-button>
							</a-dropdown>
							<a-button type="primary" @click="handleLogOut">
								<template #icon>
									<LogoutOutlined />
								</template>
							</a-button>
						</a-col>
					</a-row>
				</a-row>
			</a-card>
		</a-row>
	</template>
</template>

<script lang="ts">
import { DownOutlined, LogoutOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { WalletType, NetworkTypes } from "@/types";
import {
	MyAlgoWalletSession,
	WallectConnectSession,
	WebMode,
} from "@algo-builder/web";
import WalletStore from "../store/WalletStore";
import { searchForAssetsByName, searchApplicationAndAccount } from "@/indexer";
import { GOV_TOKEN_ASSET } from "../constants/constant";
import DaoID from "@/store/DaoID";
import {
	openErrorNotificationWithIcon,
	WALLET_CONNECTION_ERROR,
} from "@/constants";
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
			selectedNetwork: NetworkTypes.NONE,
			NetworkTypes,
			walletAddresses: new Array<string>(),
		};
	},
	mounted() {
		searchForAssetsByName(GOV_TOKEN_ASSET)
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
			setWalletType: walletStore.setWalletType,
			setAddress: walletStore.setWalletAddress,
			walletStore,
		};
	},
	methods: {
		connectWallet(walletType: WalletType) {
			if (!this.walletStore.network) {
				openErrorNotificationWithIcon(
					`Please select a network to connect with ${walletType}`
				);
			} else {
				this.selectedWallet = walletType;
				this.setWalletType(walletType);

				switch (walletType) {
					case WalletType.ALGOSIGNER:
						this.connectAlgoSigner();
						break;
					case WalletType.MY_ALGO: {
						this.connectMyAlgoWallet();
						break;
					}
					case WalletType.WALLET_CONNECT: {
						this.connectWalletConnect();
						break;
					}
					default:
						console.warn("Wallet %s not supported", walletType);
				}
			}
		},
		async connectAlgoSigner() {
			try {
				const webMode = new WebMode(AlgoSigner, this.walletStore.network);
				this.walletStore.setWebMode(webMode);
				const algoSignerResponse = await AlgoSigner.connect({
					ledger: this.walletStore.network,
				});
				console.log("Connected to AlgoSigner:", algoSignerResponse);
				await this.getUserAccount();
			} catch (e) {
				openErrorNotificationWithIcon(
					WALLET_CONNECTION_ERROR("AlgoSigner"),
					e.message
				);
				console.error(e);
			}
		},
		async getUserAccount() {
			const userAccount = await AlgoSigner.accounts({
				ledger: this.walletStore.network,
			});
			if (userAccount && userAccount.length) {
				this.walletAddress = userAccount[0].address;
				this.setAddress(userAccount[0].address);
				this.walletAddresses = userAccount.map(
					(acc: { address: string }) => acc.address
				);
				searchApplicationAndAccount();
			}
		},
		async connectMyAlgoWallet() {
			try {
				let myAlgo = new MyAlgoWalletSession(this.walletStore.network);
				await myAlgo.connectToMyAlgo();
				this.walletStore.setWebMode(myAlgo);
				if (myAlgo.accounts.length) {
					this.walletAddress = myAlgo.accounts[0].address;
					this.setAddress(myAlgo.accounts[0].address);
				}
			} catch (e) {
				openErrorNotificationWithIcon(
					WALLET_CONNECTION_ERROR("MyAlgo Wallet"),
					e.message
				);
				console.error(e);
			}
		},
		async connectWalletConnect() {
			try {
				let walletConnector = new WallectConnectSession(
					this.walletStore.network
				);
				await walletConnector.create(true);
				this.walletStore.setWebMode(walletConnector);

				walletConnector.onConnect((error, response) => {
					if (response.accounts.length) {
						this.walletAddress = response.accounts[0];
						this.setAddress(response.accounts[0]);
					}
					if (error) {
						openErrorNotificationWithIcon(
							WALLET_CONNECTION_ERROR("Wallet Connect"),
							error.message
						);
					}
				});
			} catch (e) {
				openErrorNotificationWithIcon(
					WALLET_CONNECTION_ERROR("Wallet Connect"),
					e.message
				);
				console.error(e);
			}
		},
		// eslint-disable-next-line
		handleWalletConnect(e: any) {
			console.log("changing wallet kind", e.key);
			this.connectWallet(e.key);
		},
		handleNetworkConnect(e: any) {
			if (e.key) {
				this.handleLogOut();
				this.selectedNetwork = e.key;
				this.walletStore.setNetworkTypes(e.key);
			}
		},
		handleAddressSwitch(e: any) {
			if (e.key) {
				const addr = e.key;
				this.walletAddress = addr;
				this.setAddress(addr);
				searchApplicationAndAccount();
				console.log("Address Switched.");
			}
		},
		handleLogOut() {
			console.log("Wallet Disconnected");
			this.walletAddress = "";
			this.setAddress("");
			DaoID().handleLogOut();
			this.setWalletType(WalletType.NONE);
			this.selectedWallet = WalletType.NONE;
		},
		getTruncatedAddress(addr: string) {
			return addr.substring(0, 4) + "..." + addr.slice(-4);
		},
	},
});
</script>
