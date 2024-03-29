<template>
	<template v-if="!walletAddress">
		<a-row :gutter="16">
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
						<span v-if="selectedWallet === WalletType.NONE">
							Connect Wallet</span
						>
						<span v-else>Wallet : {{ selectedWallet }}</span>

						<DownOutlined />
					</a-button>
				</a-dropdown>
			</a-col>

			<a-col v-if="selectedWallet !== WalletType.NONE">
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
					<a-button class="margin_top_sm">
						<span v-if="selectedNetwork === NetworkTypes.NONE">
							Select Network</span
						>
						<span v-else>Network : {{ selectedNetwork }}</span>
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
					<a-typography-text strong>Address: </a-typography-text>
					<a-typography-link :copyable="{ text: walletAddress }">
						<a-tooltip>
							<template #title>{{ walletAddress }}</template>
							{{ getTruncatedAddress(walletAddress, 4) }}
						</a-tooltip>
					</a-typography-link>
				</a-row>
				<a-row>
					<span class="margin_right_extra_sm margin_top_extra_sm">
						<a-typography-text strong>Wallet: </a-typography-text>
						<a-typography-link>{{ selectedWallet }}</a-typography-link>
					</span>
				</a-row>
				<a-row>
					<a-dropdown v-if="selectedWallet === WalletType.ALGOSIGNER">
						<template #overlay>
							<a-menu @click="handleAddressSwitch">
								<a-menu-item v-for="addr in walletAddresses" :key="addr">
									{{ addr }}
								</a-menu-item>
							</a-menu>
						</template>
						<a-button>
							<span>{{ getTruncatedAddress(walletAddress, 4) }}</span>
							<DownOutlined />
						</a-button>
					</a-dropdown>
					<a-button type="primary" @click="handleLogOut">
						<template #icon>
							<LogoutOutlined />
						</template>
					</a-button>
				</a-row>
			</a-card>
		</a-row>
	</template>
</template>

<script lang="ts">
import { DownOutlined, LogoutOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { WalletType, NetworkTypes, EndPoint } from "@/types";
import {
	MyAlgoWalletSession,
	WallectConnectSession,
	WebMode,
} from "@algo-builder/web";
import WalletStore from "../store/WalletStore";
import { searchApplicationAndAccount } from "@/indexer";
import DaoID from "@/store/DaoID";
import {
	openErrorNotificationWithIcon,
	WALLET_CONNECTION_ERROR,
	walletMessage,
} from "@/constants";
import { getWalletConfig, getTruncatedAddress, redirectTo } from "@/utility";
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
			getTruncatedAddress,
			EndPoint,
		};
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
					walletMessage.NETWORK_ISSUE(walletType as string)
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
				let myAlgo = new MyAlgoWalletSession(getWalletConfig());
				await myAlgo.connectToMyAlgo();
				this.walletStore.setWebMode(myAlgo);
				if (myAlgo.accounts.length) {
					this.walletAddress = myAlgo.accounts[0].address;
					this.setAddress(myAlgo.accounts[0].address);
					searchApplicationAndAccount();
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
				let walletConnector = new WallectConnectSession(getWalletConfig());
				await walletConnector.create(true);
				this.walletStore.setWebMode(walletConnector);

				walletConnector.onConnect((error, response) => {
					if (response.accounts.length) {
						this.walletAddress = response.accounts[0];
						this.setAddress(response.accounts[0]);
						searchApplicationAndAccount();
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
			this.handleLogOut();
			this.selectedWallet = e.key;
			this.setWalletType(e.key);
		},
		handleNetworkConnect(e: any) {
			if (e.key) {
				this.selectedNetwork = e.key;
				this.walletStore.setNetworkTypes(e.key);
				this.connectWallet(this.walletStore.walletKind);
			}
		},
		handleAddressSwitch(e: any) {
			if (e.key) {
				const addr = e.key;
				this.walletAddress = addr;
				this.setAddress(addr);
				searchApplicationAndAccount();
				// refresh proposal info page
				if (this.$route.fullPath === EndPoint.PROPOSAL_INFO) {
					redirectTo(this.$router, EndPoint.PROPOSALS);
				}
			}
		},
		handleLogOut() {
			console.log("Wallet Disconnected");
			this.walletAddress = "";
			this.setAddress("");
			DaoID().resetDaoStore();
			this.setWalletType(WalletType.NONE);
			this.selectedWallet = WalletType.NONE;
			this.selectedNetwork = NetworkTypes.NONE;
			this.walletStore.setNetworkTypes(NetworkTypes.NONE);
			redirectTo(this.$router, EndPoint.ALL_DAO);
		},
	},
});
</script>
