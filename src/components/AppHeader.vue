<template>
	<div class="header" id="header">
		<div class="grid">
			<div class="flexbox">
				<h1>SigmaDao</h1>
				<div class="menu_id">
					<label for="dao_id" style="padding-right: 10px">DAO ID</label>
					<input id="dao_id" v-model="id" type="number" />
				</div>
				<div class="menu">
					<router-link :to="{ path: '/vote' }">
						<a-button
							class="menu_option"
							:type="currentPageKey === NavigationKey.VOTE ? 'link' : 'text'"
							@click="() => handleMenuClick(NavigationKey.VOTE)"
							>Vote</a-button
						>
					</router-link>
					<router-link :to="{ path: '/addProposal' }">
						<a-button
							class="menu_option"
							:type="
								currentPageKey === NavigationKey.ADD_PROPOSAL ? 'link' : 'text'
							"
							@click="() => handleMenuClick(NavigationKey.ADD_PROPOSAL)"
							>Add Proposal</a-button
						>
					</router-link>
				</div>
			</div>
			<div class="right_corner">
				<WalletConnect />
			</div>
		</div>
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
	padding-block: 10px;
	padding-inline: 20px;
	height: auto;
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
	position: fixed;
	top: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 1400px;
	background-color: white;
	z-index: 9998;
	font-size: 15px !important;
}

.grid {
	display: grid;
	grid-template-columns: auto max-content;
	align-items: center;
}

.right_corner {
	justify-self: flex-end;
}

.flexbox {
	display: flex;
}

.menu {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	align-self: center;
}
.menu_option {
	font-size: 20px;
}
.menu_id {
	align-self: center;
	margin-inline: 20px;
}
</style>
