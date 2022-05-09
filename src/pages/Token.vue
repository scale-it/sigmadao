<template>
	<opt-in-error>
		<a-tabs v-model:activeKey="activeKey" type="card" centered>
			<a-tab-pane :key="VoteTokenType.DEPOSIT_TOKEN" tab="Deposit Vote Token"
				><deposit-token
			/></a-tab-pane>
			<a-tab-pane
				:key="VoteTokenType.WITHDRAW_TOKEN"
				tab="Withdraw Vote Token"
				force-render
				><withdraw-token
			/></a-tab-pane>
		</a-tabs>
	</opt-in-error>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { VoteTokenType } from "@/types";
import DepositToken from "./DepositToken.vue";
import WithdrawToken from "./WithdrawToken.vue";
import OptInError from "@/components/OptInError.vue";

export default defineComponent({
	name: "VoteToken",
	components: { DepositToken, WithdrawToken, OptInError },
	setup() {
		return {
			activeKey: ref(VoteTokenType.DEPOSIT_TOKEN),
			VoteTokenType,
		};
	},
});
</script>
