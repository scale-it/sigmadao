<template>
	<div class="app_root">
		<div>
			<AppHeader />
			<div
				class="margin_top_sm"
				v-if="walletStore.network !== NetworkTypes.NONE"
			>
				<router-view />
			</div>
		</div>
		<AppFooter />
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import WalletStore from "@/store/WalletStore";
import { NetworkTypes } from "@/types";

export default defineComponent({
	name: "App",
	components: { AppHeader, AppFooter },
	data() {
		return {
			walletStore: WalletStore(),
			NetworkTypes,
		};
	},
});
</script>

<style>
@import "./styles/style.css";
</style>
