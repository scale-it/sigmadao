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
import { searchForApplication } from "@/indexer";
import { storeToRefs } from "pinia";

export default defineComponent({
	components: {
		WalletConnect,
	},
	data() {
		const Daostore = storeToRefs(DaoStore());
		return {
			currentPageKey: 0,
			NavigationKey: NavigationKey,
			EndPoint,
			dao_id: Daostore.dao_id,
			govt_id: Daostore.govt_id,
			name: Daostore.name,
			availableTokens: Daostore.available,
			lockedTokens: Daostore.locked,
			showIDTextField: false,
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
				searchForApplication(+this.dao_id);
			}
		},
	},
});
</script>
