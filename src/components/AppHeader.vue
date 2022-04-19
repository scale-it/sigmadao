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
							<router-link :to="{ path: EndPoint.VOTE }">
								<a-button
									class="menu_option"
									:type="isLinkActive(NavigationKey.PROPOSALS)"
									@click="() => handleMenuClick(NavigationKey.PROPOSALS)"
									>Vote</a-button
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
						</div>
					</a-col>
				</a-row>
				<a-row class="dao-table">
					<a-col :span="24">
						<a-descriptions :column="5" size="small" bordered layout="vertical">
							<a-descriptions-item label="DAO App ID">
								<div @click="handleIDListener">
									<a-input
										v-model:value="dao_id"
										type="number"
										v-if="showIDTextField"
										@keyup.enter="searchID"
										@blur="searchID"
									/>
									<div v-else>
										<div v-if="dao_id">{{ dao_id }}</div>
										<div v-else>Enter ID</div>
									</div>
								</div></a-descriptions-item
							>
							<a-descriptions-item label="DAO Name">{{
								name
							}}</a-descriptions-item>
							<a-descriptions-item label="Govt Token ID">
								{{ govt_id }}
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
			</div>
		</a-page-header>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WalletConnect from "./WalletConnect.vue";
import { NavigationKey, EndPoint } from "../types/enum.types";
import DaoStore from "../store/DaoID";
import WalletStore from "../store/WalletStore";
import { searchForAccount, searchForApplication } from "@/indexer";
import { storeToRefs } from "pinia";
import {
	GLOBAL_STATE_MAP_KEY,
	LOCAL_STATE_MAP_KEY,
} from "@/constants/constant";

export default defineComponent({
	components: {
		WalletConnect,
	},
	data() {
		const daoStore = storeToRefs(DaoStore());
		return {
			currentPageKey: 0,
			NavigationKey: NavigationKey,
			EndPoint,
			dao_id: daoStore.dao_id,
			govt_id: daoStore.govt_id,
			name: daoStore.name,
			availableTokens: daoStore.available,
			lockedTokens: daoStore.locked,
			showIDTextField: false,
			global_app_state: daoStore.global_app_state,
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
		searchID() {
			this.showIDTextField = false;
			if (this.dao_id) {
				this.dao_id = +this.dao_id;
				searchForApplication(+this.dao_id)
					.then((response) => {
						if (response) {
							this.global_app_state = response;
							this.name = this.global_app_state.get(
								GLOBAL_STATE_MAP_KEY.DaoName
							) as string;
						}
					})
					.catch((error) => console.log(error));
				const walletStore = WalletStore();
				if (walletStore.address) {
					searchForAccount(walletStore.address, +this.dao_id)
						.then((response) => {
							if (response.localStateMap) {
								this.lockedTokens = response.localStateMap.get(
									LOCAL_STATE_MAP_KEY.Deposit
								) as number;
								this.availableTokens =
									response.total_amount - this.lockedTokens;
							}
						})
						.catch((error) => {
							console.log(error);
						});
				}
			}
		},
	},
});
</script>
