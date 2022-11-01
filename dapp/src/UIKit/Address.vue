<template>
	<a-typography-link :copyable="{ text: walletAddress }">
		<a-tooltip>
			<template #title>{{ walletAddress }}</template>
			{{ getTruncatedAddress(walletAddress) }}
		</a-tooltip>
	</a-typography-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "AddressCopyable",
	props: ["walletAddress"],
	methods: {
		getTruncatedAddress(addr: string) {
			return addr.substring(0, 4) + "..." + addr.slice(-4);
		},
	},
});
</script>
