<template>
	<div class="components-page-header-demo-responsive">
		<a-page-header>
			<template #title>
				<img src="../assets/logo.png" class="logo" />
			</template>
			<template #extra>
				<WalletConnect />
			</template>
			<div class="content">
				<a-row align="middle" justify="center">
					<a-col class="menu" :span="24">
						<div>
							<!-- add route after page component is added  -->
							<router-link :to="{ path: EndPoint.ALL_DAO }">
								<a-button
									class="menu_option"
									:type="isLinkActive(NavigationKey.DAOs)"
									@click="() => handleMenuClick(NavigationKey.DAOs)"
									>All DAOs</a-button
								>
							</router-link>
							<a-button
								class="menu_option"
								:type="isLinkActive(NavigationKey.CREATE_DAO)"
								@click="() => handleMenuClick(NavigationKey.CREATE_DAO)"
								>Create DAO</a-button
							>

							<router-link :to="{ path: EndPoint.ADD_PROPOSAL }">
								<a-button
									class="menu_option"
									:type="isLinkActive(NavigationKey.ADD_PROPOSAL)"
									@click="() => handleMenuClick(NavigationKey.ADD_PROPOSAL)"
									:disabled="DaoStore().disableActions"
									>Add Proposal</a-button
								>
							</router-link>
							<router-link :to="{ path: EndPoint.VOTE_TOKEN }">
								<a-button
									class="menu_option"
									:type="isLinkActive(NavigationKey.VOTE_TOKEN)"
									@click="() => handleMenuClick(NavigationKey.VOTE_TOKEN)"
									:disabled="DaoStore().disableActions"
									>Deposit Vote Tokens</a-button
								>
							</router-link>
							<router-link :to="{ path: EndPoint.VOTE }">
								<a-button
									class="menu_option"
									:type="isLinkActive(NavigationKey.PROPOSALS)"
									@click="() => handleMenuClick(NavigationKey.PROPOSALS)"
									:disabled="DaoStore().disableActions"
									>Vote</a-button
								>
							</router-link>
						</div>
					</a-col>
				</a-row>
				<a-row class="dao-table">
					<a-col :span="24">
						<a-descriptions :column="5" size="small" bordered layout="vertical">
							<a-descriptions-item label="DAO App ID">
								<a-input-search
									v-model:value="daoID"
									type="number"
									enter-button
									@search="searchID"
									placeholder="Enter ID"
								/>
							</a-descriptions-item>
							<a-descriptions-item label="DAO Name">{{
								name
							}}</a-descriptions-item>
							<a-descriptions-item label="Govt Token ID">
								{{ govtId }}
							</a-descriptions-item>
							<a-descriptions-item label="*available">{{
								availableTokens
							}}</a-descriptions-item>
							<a-descriptions-item label="*locked">{{
								lockedTokens
							}}</a-descriptions-item>
						</a-descriptions>
					</a-col>
				</a-row>
				<a-row class="opt_btn" v-if="showOptIn">
					<a-col class="menu" :span="24">
						<a-button type="primary" @click="optIn">Opt-in DAO App</a-button>
					</a-col>
				</a-row>
			</div>
		</a-page-header>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WalletConnect from "./WalletConnect.vue";
import { NavigationKey, EndPoint } from "../types/enum.types";
import DaoStore from "../store/DaoID";
import { isApplicationOpted, searchApplicationAndAccount } from "@/indexer";
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
import { optInDaoApp } from "@/utility";
import { DaoTableData } from "@/types";

export default defineComponent({
	components: {
		WalletConnect,
	},
	data() {
		const daoStore = storeToRefs(DaoStore());
		const walletStore = WalletStore();
		return {
			currentPageKey: 0,
			NavigationKey: NavigationKey,
			EndPoint,
			daoID: daoStore.dao_id,
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
		};
	},
	methods: {
		handleMenuClick(value: number) {
			this.currentPageKey = value;
			console.log(value);
		},
		isLinkActive(currentPage: number) {
			if (this.currentPageKey === currentPage) {
				return "link";
			}
			return "text";
		},
		async searchID() {
			if (this.daoID) {
				const tempDaoID: number = +this.daoID;
				this.daoID = +this.daoID;
				// TODO: update to use filter from backend (for daoID)
				// to get gov token id
				let daoData: DaoTableData | undefined = undefined;
				if (this.psqlData) {
					daoData = this.psqlData.get(this.daoID);
				}

				if (daoData) {
					this.govtId = daoData.token_id;
					loadingMessage(this.key);
					searchApplicationAndAccount()
						.then(() => {
							successMessage(this.key);
							openSuccessNotificationWithIcon(
								"Successful",
								daoAppMessage.SUCCESSFUL(this.daoID as number)
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
											daoAppMessage.UNSUCCESFUL,
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
					await optInDaoApp(
						this.walletStore.address,
						this.daoID,
						this.walletStore.webMode
					);
					this.showOptIn = false;
					openSuccessNotificationWithIcon(
						"Successful",
						daoAppMessage.SUCCESSFUL(this.daoID)
					);
				}
			} catch (error) {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
			}
		},
	},
});
</script>
