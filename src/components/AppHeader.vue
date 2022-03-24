<template>
	<!-- TODO: Update to ANTD menu and header -->
	<div class="header" id="header">
		<a-row align="middle">
			<a-col :span="19">
				<a-row>
					<a-col :span="3">
						<div style="position: absolute">
							<img src="../assets/logo.svg" width="auto" />
						</div>
					</a-col>
					<a-col :span="6">
						<div class="menu_id">
							<label for="dao_id" style="padding-right: 10px">DAO ID</label>
							<input id="dao_id" v-model="id" type="number" />
						</div>
						<div class="menu_id">
							<p>DAO Name:</p>
							<p>Name</p>
						</div>
						<div class="menu_id">
							<p>Govt Token:</p>
							<p>46546546546</p>
						</div>
						<div class="menu_id">
							<p>* available:</p>
							<p>56</p>
						</div>
						<div class="menu_id">
							<p>* locked:</p>
							<p>5444</p>
						</div>
					</a-col>
					<a-col :offset="10">
						<div>
							<a-button
								class="menu_option"
								:type="
									currentPageKey === NavigationKey.CREATE_DAO ? 'link' : 'text'
								"
								@click="() => handleMenuClick(NavigationKey.CREATE_DAO)"
								>Create DAO</a-button
							>

							<a-button
								class="menu_option"
								:type="
									currentPageKey === NavigationKey.ALL_DAO ? 'link' : 'text'
								"
								@click="() => handleMenuClick(NavigationKey.ALL_DAO)"
								>All DAOs</a-button
							>
							<router-link :to="{ path: '/vote' }">
								<a-button
									class="menu_option"
									:type="
										currentPageKey === NavigationKey.VOTE ? 'link' : 'text'
									"
									@click="() => handleMenuClick(NavigationKey.VOTE)"
									>Vote</a-button
								>
							</router-link>
							<router-link :to="{ path: '/addProposal' }">
								<a-button
									class="menu_option"
									:type="
										currentPageKey === NavigationKey.ADD_PROPOSAL
											? 'link'
											: 'text'
									"
									@click="() => handleMenuClick(NavigationKey.ADD_PROPOSAL)"
									>Add Proposal</a-button
								>
							</router-link>
						</div>
					</a-col>
				</a-row>
			</a-col>
			<a-col :span="5">
				<div>
					<WalletConnect />
				</div>
			</a-col>
		</a-row>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WalletConnect from "./WalletConnect.vue";
import { NavigationKey } from "../types/enum.types";
import DaoIDStore from "../store/DaoID";

export default defineComponent({
	components: {
		WalletConnect,
	},
	data() {
		return {
			currentPageKey: "",
			NavigationKey: NavigationKey,
		};
	},
	methods: {
		handleMenuClick(value: string) {
			this.currentPageKey = value;
			console.log(value);
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
<style scoped>
.header {
	width: 1400px;
	height: auto;
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
	font-size: 15px !important;
	padding: 10px;
	margin: auto;
}

.flexbox {
	display: flex;
}

.menu_option {
	font-size: 18px;
}
.menu_id {
	display: flex;
}
</style>
