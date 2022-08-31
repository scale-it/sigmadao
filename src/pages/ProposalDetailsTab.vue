<template>
	<a-tabs v-model:activeKey="activeKey" type="card" centered>
		<a-tab-pane :key="ProposalDetailType.PROPOSAL_VOTE" tab="Vote" force-render
			><VotePage
		/></a-tab-pane>
		<a-tab-pane
			:key="ProposalDetailType.WITHDRAW_PROPOSAL"
			tab="Withdraw Proposal"
			><WithdrawFromProposal
		/></a-tab-pane>
		<a-tab-pane
			:key="ProposalDetailType.EXECUTE_PROPOSAL"
			tab="Execute Proposal"
			force-render
		>
			<ExecuteProposal :proposalInfo="proposalInfo" />
		</a-tab-pane>
	</a-tabs>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { ProposalDetailType } from "@/types";
import WithdrawFromProposal from "./WithdrawFromProposal.vue";
import ExecuteProposal from "./ExecuteProposal.vue";
import VotePage from "./Vote.vue";

export default defineComponent({
	name: "ProposalDetailsTab",
	components: { WithdrawFromProposal, VotePage, ExecuteProposal },
	props: ["proposalInfo"],
	setup() {
		return {
			activeKey: ref(ProposalDetailType.PROPOSAL_VOTE),
			ProposalDetailType,
		};
	},
});
</script>
