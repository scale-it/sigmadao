<template>
	<div class="components-page-header-demo-responsive">
		<a-page-header>
			<template #title>
				<router-link :to="{ path: EndPoint.ALL_DAO }">
					<img src="../assets/logo.png" class="logo" />
				</router-link>
			</template>
			<template #extra>
				<div style="width: min-content">
					<div style="width: min-content">
						<WalletConnect />
					</div>
				</div>
			</template>
			<div v-if="walletStore.network === NetworkTypes.NONE">
				<a-result title="Please select a network to access DAOs" />
			</div>
			<div v-else>
				<div class="content">
					<a-row align="middle" justify="center">
						<a-col class="menu" :span="24">
							<div>
								<!-- add route after page component is added  -->
								<router-link :to="{ path: EndPoint.ALL_DAO }">
									<a-button
										class="menu_option"
										:type="isLinkActive(EndPoint.ALL_DAO)"
										>All DAOs</a-button
									>
								</router-link>
								<router-link :to="{ path: EndPoint.PROPOSALS }">
									<a-button
										class="menu_option"
										:type="isLinkActive(EndPoint.PROPOSALS)"
										:disabled="!DaoStore().isDaoSelected"
										>Proposals</a-button
									>
								</router-link>
								<router-link :to="{ path: EndPoint.VOTE_TOKEN }">
									<a-button
										class="menu_option"
										:type="isLinkActive(EndPoint.VOTE_TOKEN)"
										:disabled="DaoStore().disableActions"
										>Deposit Vote Tokens</a-button
									>
								</router-link>
							</div>
						</a-col>
					</a-row>
					<a-row class="dao-table" type="flex">
						<a-col flex="auto">
							<a-descriptions
								:column="{ xs: 3, sm: 5 }"
								size="small"
								bordered
								layout="vertical"
							>
								<a-descriptions-item label="DAO App ID">
									<a-input-search
										v-model:value="daoID"
										type="number"
										@search="searchID"
										placeholder="Select DAO by App ID"
									>
										<template #enterButton>
											<a-button type="primary">Select</a-button>
										</template>
									</a-input-search>
								</a-descriptions-item>
								<a-descriptions-item label="DAO Name">{{
									name
								}}</a-descriptions-item>
								<a-descriptions-item label="Gov Token ID">
									{{ govtId }}
								</a-descriptions-item>
								<a-descriptions-item>
									<template #label>
										Available
										<info-tool-tip
											data="The tokens are available for you to deposit and vote."
										/>
									</template>
									{{ availableTokens }}</a-descriptions-item
								>
								<a-descriptions-item>
									<template #label>
										Locked
										<info-tool-tip
											data="The tokens are locked for the voting period. You can
												withdraw them once the voting period ends."
										/>
									</template>
									{{ lockedTokens }}</a-descriptions-item
								>
							</a-descriptions>
						</a-col>
					</a-row>
					<a-row class="opt_btn" v-if="showOptIn">
						<a-col class="menu" :span="24">
							<a-button type="primary" @click="optIn">Opt-in DAO App</a-button>
						</a-col>
					</a-row>
				</div>
			</div>
		</a-page-header>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WalletConnect from "./WalletConnect.vue";
import { EndPoint, SearchDaoType, NetworkTypes } from "../types/enum.types";
import DaoStore from "../store/DaoID";
import {
	handleDaoSearch,
	isApplicationOpted,
	searchApplicationAndAccount,
} from "@/indexer";
import { storeToRefs } from "pinia";
import {
	daoAppMessage,
	DAO_ID_ERROR,
	errorMessage,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	successMessage,
	UNSUCCESSFUL,
} from "@/constants";
import WalletStore from "@/store/WalletStore";
import { optInToAppUsingSecretKey } from "@/utility";
import InfoToolTip from "./InfoToolTip.vue";

export default defineComponent({
	components: {
		WalletConnect,
		InfoToolTip,
	},
	data() {
		const daoStore = storeToRefs(DaoStore());
		const walletStore = WalletStore();
		const { network } = storeToRefs(WalletStore());
		return {
			EndPoint,
			daoID: daoStore.searchDaoId,
			govtId: daoStore.govt_id,
			name: daoStore.name,
			availableTokens: daoStore.available,
			lockedTokens: daoStore.locked,
			showOptIn: daoStore.show_opt_in,
			psqlData: daoStore.psqlData,
			key: "HeaderKey",
			walletStore,
			resetDaoStore: DaoStore().resetDaoStore,
			DaoStore,
			network,
			NetworkTypes,
		};
	},
	methods: {
		isLinkActive(currentPage: EndPoint) {
			const currentPagePath = this.$route.path;
			if (currentPagePath === currentPage) {
				return "link";
			}
			return "text";
		},
		async searchID(value: number) {
			if (this.daoID) {
				this.daoID = +this.daoID;
				const response = await handleDaoSearch(
					SearchDaoType.SEARCH_BY_APPLCATION_ID,
					this.daoID,
					null,
					null,
					null,
					null
				);
				if (response) {
					this.govtId = response.token_id;
					this.name = response.name;
					this.daoID = value;
					loadingMessage(this.key);
					searchApplicationAndAccount()
						.then(() => {
							successMessage(this.key);
							openSuccessNotificationWithIcon(
								"Successful",
								daoAppMessage.DAO_SUCCESSFUL(this.daoID as number)
							);
							if (this.walletStore.address) {
								isApplicationOpted(
									this.walletStore.address,
									this.daoID as number
								)
									.then((appIsOptedIn: boolean) => {
										this.showOptIn = !appIsOptedIn;
										if (appIsOptedIn) {
											openSuccessNotificationWithIcon(
												daoAppMessage.ALREADY_OPT_IN
											);
										}
									})
									.catch((error) =>
										openErrorNotificationWithIcon(
											daoAppMessage.DAO_UNSUCCESFUL,
											error.message
										)
									);
							}
						})
						.catch((error) => {
							errorMessage(this.key);
							openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
						});
				} else {
					openErrorNotificationWithIcon(UNSUCCESSFUL, DAO_ID_ERROR(this.daoID));
					this.resetDaoStore();
				}
			} else {
				// when daoID is removed
				this.resetDaoStore();
			}
		},
		async optIn() {
			try {
				if (this.daoID) {
					await optInToAppUsingSecretKey(
						this.walletStore.address,
						this.daoID,
						this.walletStore.webMode
					);
					this.showOptIn = false;
					openSuccessNotificationWithIcon(
						"Successful",
						daoAppMessage.OPT_IN_SUCCESSFUL(this.daoID)
					);
				}
			} catch (error) {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
			}
		},
	},
});
</script>
