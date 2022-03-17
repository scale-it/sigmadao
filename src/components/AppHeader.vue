<template>
	<!-- TODO: Update to ANTD menu and header -->
	<div class="header" id="header">
		<a-row class="veritcal_center">
			<a-col :span="20">
				<a-row class="veritcal_center">
					<a-col :span="4">
						<h1>SigmaDao</h1>
					</a-col>
					<a-col :span="8">
						<div class="menu_id">
							<label for="dao_id" style="padding-right: 10px">DAO ID</label>
							<input id="dao_id" v-model="id" type="number" />
						</div>
					</a-col>
					<a-col>
						<div>
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
			<a-col :span="4">
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

.veritcal_center {
	align-items: center;
}

.flexbox {
	display: flex;
}

.menu_option {
	font-size: 20px;
}
.menu_id {
	align-self: center;
}
</style>
