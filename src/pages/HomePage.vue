<template>
	<AppHeader />
	<WalletConnect />
	<AppFooter />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppHeader from "../components/AppHeader.vue";
import AppFooter from "../components/AppFooter.vue";
import WalletConnect from "../components/WalletConnect.vue";

export default defineComponent({
	components: {
		AppHeader,
		WalletConnect,
		AppFooter,
	},
});
</script>
