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
							<a-button
								class="menu_option"
								:type="isLinkActive(NavigationKey.CREATE_DAO)"
								@click="() => handleMenuClick(NavigationKey.CREATE_DAO)"
								>Create DAO</a-button
							>

							<router-link :to="{ path: EndPoint.ALL_DAO }">
								<a-button
									class="menu_option"
									:type="isLinkActive(NavigationKey.DAOs)"
									@click="() => handleMenuClick(NavigationKey.DAOs)"
									>All DAOs</a-button
								>
							</router-link>
							<router-link :to="{ path: EndPoint.ADD_PROPOSAL }">
								<a-button
									class="menu_option"
									:type="isLinkActive(NavigationKey.ADD_PROPOSAL)"
									@click="() => handleMenuClick(NavigationKey.ADD_PROPOSAL)"
									>Add Proposal</a-button
								>
							</router-link>
							<router-link :to="{ path: EndPoint.VOTE_TOKEN }">
								<a-button
									class="menu_option"
									:type="isLinkActive(NavigationKey.VOTE_TOKEN)"
									@click="() => handleMenuClick(NavigationKey.VOTE_TOKEN)"
									>Vote Tokens</a-button
								>
							</router-link>
							<router-link :to="{ path: EndPoint.VOTE }">
								<a-button
									class="menu_option"
									:type="isLinkActive(NavigationKey.PROPOSALS)"
									@click="() => handleMenuClick(NavigationKey.PROPOSALS)"
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
								<div @click="handleIDListener">
									<a-input
										v-model:value="daoID"
										type="number"
										v-if="showIDTextField"
										@keyup.enter="searchID"
										@blur="searchID"
									/>
									<div v-else>
										<div v-if="daoID">{{ daoID }}</div>
										<div v-else>Enter ID</div>
									</div>
								</div></a-descriptions-item
							>
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
	errorMessage,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	successMessage,
} from "@/constants";
import WalletStore from "@/store/WalletStore";
import { optInDaoApp } from "@/utility";

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
			showIDTextField: false,
			key: "HeaderKey",
			walletStore,
			removeDaoData: DaoStore().removeDaoID,
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
		handleIDListener() {
			this.showIDTextField = true;
		},
		async searchID() {
			this.showIDTextField = false;
			if (this.daoID) {
				this.daoID = +this.daoID;
				loadingMessage(this.key);
				searchApplicationAndAccount()
					.then(() => {
						successMessage(this.key);
						openSuccessNotificationWithIcon(
							"Successful",
							`Your DAO App of ID ${this.daoID} is selected.`
						);
						if (this.walletStore.address) {
							isApplicationOpted(this.walletStore.address, this.daoID as number)
								.then((appIsOptedIn: boolean) => {
									this.showOptIn = !appIsOptedIn;
									if (appIsOptedIn) {
										openSuccessNotificationWithIcon(
											"You have already Opted-in DAO App"
										);
									}
								})
								.catch((error) =>
									openErrorNotificationWithIcon(
										"Unsuccessful while getting DAO App Opt-in Details",
										error.message
									)
								);
						}
					})
					.catch((error) => {
						errorMessage(this.key);
						openErrorNotificationWithIcon("Unsuccessful", error.message);
					});
			} else {
				// when daoID is removed
				this.removeDaoData();
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
						`You have opted in DAO App.`
					);
				}
			} catch (error) {
				openErrorNotificationWithIcon("Unsuccessful", error.message);
			}
		},
	},
});
</script>
