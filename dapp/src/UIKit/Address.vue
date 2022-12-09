<template>
	<a-typography-link :copyable="{ text: walletAddress }">
		<a-tooltip>
			<template #title>{{ walletAddress }}</template>
			{{ getTruncatedAddress(walletAddress, 4) }}
		</a-tooltip>
	</a-typography-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getTruncatedAddress } from "@/utility";

export default defineComponent({
	name: "AddressCopyable",
	props: ["walletAddress"],
	data() {
		return {
			getTruncatedAddress,
		};
	},
});
</script>
