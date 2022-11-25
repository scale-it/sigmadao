<template>
	<a-breadcrumb class="margin_bottom_sm">
		<a-breadcrumb-item
			><a @click="redirectToAllProposal">All Proposals</a></a-breadcrumb-item
		>
		<a-breadcrumb-item>Proposal Info</a-breadcrumb-item>
	</a-breadcrumb>
	<br />
	<a-tabs v-model:activeKey="activeKey" type="card" centered>
		<template #rightExtra>
			<a-tag :color="color">{{ text }}</a-tag>
		</template>
		<a-tab-pane :key="ProposalDetailType.DETAILS" tab="Details" force-render
			><ProposalInfo
		/></a-tab-pane>
		<a-tab-pane
			:key="ProposalDetailType.WITHDRAW_AND_CLOSE_PROPOSAL"
			tab="Withdraw And Close"
			force-render
			><WithdrawAndClose
		/></a-tab-pane>
		<a-tab-pane
			:key="ProposalDetailType.EXECUTE_PROPOSAL"
			tab="Execute Proposal"
			force-render
		>
			<ExecuteProposal />
		</a-tab-pane>
	</a-tabs>
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { EndPoint, ProposalDetailType } from "@/types";
import WithdrawAndClose from "./WithdrawAndClose.vue";
import ExecuteProposal from "./ExecuteProposal.vue";
import ProposalInfo from "./ProposalInfo.vue";
import { redirectTo } from "@/utility";
import ProposalStore from "@/store/ProposalStore";
import { checkCurrentProposalState } from "@/utility/index";

export default defineComponent({
	name: "ProposalDetailsTab",
	data() {
		return {
			text: "",
			color: "",
		};
	},
	components: {
		WithdrawAndClose,
		ExecuteProposal,
		ProposalInfo,
	},
	methods: {
		redirectToAllProposal() {
			redirectTo(this.$router, EndPoint.PROPOSALS);
		},
		getStatusOfProposal() {
			const { text, color } = checkCurrentProposalState(this.proposalStore);
			this.text = text;
			this.color = color;
		},
	},
	setup() {
		const proposalStore = reactive(ProposalStore());
		return {
			activeKey: ref(ProposalDetailType.DETAILS),
			ProposalDetailType,
			proposalStore,
			checkCurrentProposalState,
		};
	},
	mounted() {
		this.getStatusOfProposal();
	},
});
</script>
