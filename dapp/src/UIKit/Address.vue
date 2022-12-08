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
	props: ["walletAddress", "truncateDigits"],
	methods: {
		getTruncatedAddress(addr: string) {
			const digits = this.truncateDigits ?? 4;
			return addr.substring(0, digits) + "..." + addr.slice(-digits);
		},
	},
});
</script>
