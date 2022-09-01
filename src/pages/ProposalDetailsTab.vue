<template>
	<a-breadcrumb class="margin_bottom_sm">
		<a-breadcrumb-item
			><a @click="redirectToAllProposal">All Proposals</a></a-breadcrumb-item
		>
		<a-breadcrumb-item>Proposal Info</a-breadcrumb-item>
	</a-breadcrumb>
	<br />
	<a-tabs v-model:activeKey="activeKey" type="card" centered>
		<a-tab-pane :key="ProposalDetailType.DETAILS" tab="Details" force-render
			><ProposalInfo
		/></a-tab-pane>
		<a-tab-pane :key="ProposalDetailType.PROPOSAL_VOTE" tab="Vote" force-render
			><VotePage
		/></a-tab-pane>
		<a-tab-pane
			:key="ProposalDetailType.WITHDRAW_PROPOSAL"
			tab="Withdraw From Proposal"
			><WithdrawFromProposal
		/></a-tab-pane>
		<a-tab-pane
			:key="ProposalDetailType.EXECUTE_PROPOSAL"
			tab="Execute Proposal"
			force-render
		>
			<ExecuteProposal />
		</a-tab-pane>
		<a-tab-pane
			:key="ProposalDetailType.CLOSE_PROPOSAL"
			tab="Close Proposal"
			force-render
		>
			<CloseProposal />
		</a-tab-pane>
	</a-tabs>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { EndPoint, ProposalDetailType } from "@/types";
import WithdrawFromProposal from "./WithdrawFromProposal.vue";
import ExecuteProposal from "./ExecuteProposal.vue";
import CloseProposal from "./CloseProposal.vue";
import VotePage from "./Vote.vue";
import ProposalInfo from "./ProposalInfo.vue";
import { redirectTo } from "@/utility";

export default defineComponent({
	name: "ProposalDetailsTab",
	components: {
		WithdrawFromProposal,
		VotePage,
		ExecuteProposal,
		CloseProposal,
		ProposalInfo,
	},
	methods: {
		redirectToAllProposal() {
			redirectTo(this.$router, EndPoint.PROPOSALS);
		},
	},
	setup() {
		return {
			activeKey: ref(ProposalDetailType.DETAILS),
			ProposalDetailType,
		};
	},
});
</script>
