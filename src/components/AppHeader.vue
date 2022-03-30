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

							<a-button
								class="menu_option"
								:type="isLinkActive(NavigationKey.ALL_DAO)"
								@click="() => handleMenuClick(NavigationKey.ALL_DAO)"
								>All DAOs</a-button
							>
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
						<a-descriptions :column="4" size="small" bordered layout="vertical">
							<a-descriptions-item label="DAO Name">Name</a-descriptions-item>
							<a-descriptions-item label="Govt Token ID">
								421421
							</a-descriptions-item>
							<a-descriptions-item label="*available">2017</a-descriptions-item>
							<a-descriptions-item label="*locked">2017</a-descriptions-item>
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
import DaoIDStore from "../store/DaoID";

export default defineComponent({
	components: {
		WalletConnect,
	},
	data() {
		return {
			currentPageKey: 0,
			NavigationKey: NavigationKey,
			EndPoint,
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
	},
	setup() {
		const daoIdStore = DaoIDStore();
		const id = daoIdStore.id;
		return {
			id,
		};
	},
});
</script>
