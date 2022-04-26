<template>
	<a-tabs v-model:activeKey="activeKey" type="card" centered>
		<a-tab-pane :key="TokenType.DEPOSIT_TOKEN" tab="Deposit Token"
			><deposit-token
		/></a-tab-pane>
		<a-tab-pane
			:key="TokenType.WITHDRAW_TOKEN"
			tab="Withdraw Token"
			force-render
			><withdraw-token
		/></a-tab-pane>
	</a-tabs>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { TokenType } from "@/types";
import DepositToken from "./DepositToken.vue";
import WithdrawToken from "./WithdrawToken.vue";

export default defineComponent({
	name: "TokenPage",
	components: { DepositToken, WithdrawToken },
	setup() {
		return {
			activeKey: ref(TokenType.DEPOSIT_TOKEN),
			TokenType,
		};
	},
});
</script>
