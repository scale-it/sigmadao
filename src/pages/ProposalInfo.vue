<template>
	<a-breadcrumb class="margin_bottom_sm">
		<a-breadcrumb-item
			><a @click="redirectToAllProposal">All Proposals</a></a-breadcrumb-item
		>
		<a-breadcrumb-item>Proposal Info</a-breadcrumb-item>
	</a-breadcrumb>
	<a-row type="flex">
		<a-col
			><a-button type="primary" @click="handleWithdrawProposalAction">
				Withdraw Proposal</a-button
			></a-col
		>

		<a-col :offset="1"
			><a-button type="primary" @click="handleExecuteProposalAction">
				Execute Proposal</a-button
			></a-col
		>
	</a-row>
	<br />
	<a-row type="flex" justify="start">
		<a-card title="Proposal Details" style="width: 400px; margin-right: 10px">
			<a-descriptions :column="1">
				<a-descriptions-item label="Name">{{
					proposalInfo.name
				}}</a-descriptions-item>
				<a-descriptions-item label="Amount">{{
					proposalInfo.amount
				}}</a-descriptions-item>
				<a-descriptions-item label="Type">{{
					ProposalType[proposalInfo.type]
				}}</a-descriptions-item>
				<a-descriptions-item label="Voting Start">{{
					secToFormat(
						proposalInfo.voting_start,
						DateTimeFormat.DAY_TIME_WITH_DAY
					)
				}}</a-descriptions-item>
				<a-descriptions-item label="Voting End">{{
					secToFormat(proposalInfo.voting_end, DateTimeFormat.DAY_TIME_WITH_DAY)
				}}</a-descriptions-item>
				<a-descriptions-item label="Execute Before">{{
					secToFormat(
						proposalInfo.execute_before,
						DateTimeFormat.DAY_TIME_WITH_DAY
					)
				}}</a-descriptions-item>
				<a-descriptions-item label="URL">{{
					proposalInfo.url
				}}</a-descriptions-item>
				<a-descriptions-item label="URL Hash">{{
					proposalInfo.url_hash
				}}</a-descriptions-item>
			</a-descriptions>
		</a-card>
		<a-card title="Vote" style="width: 400px">
			<PieChart />
		</a-card>
	</a-row>
	<br />
	<a-row type="flex" justify="center">
		<a-col :xs="{ span: 20, offset: 2 }" :sm="{ span: 14, offset: 6 }">
			<VotePage />
		</a-col>
	</a-row>
</template>

<script lang="ts">
import { ProposalType } from "@/constants";
import { defineComponent, reactive } from "vue";
import WalletStore from "../store/WalletStore";
import DaoID from "../store/DaoID";
import { secToFormat, executeProposal, withdrawProposal } from "../utility";
import { getProposalLsig } from "../contract/dao";
import { DateTimeFormat, ProposalTableData } from "@/types";
import VotePage from "./Vote.vue";
import PieChart from "../components/PieChart.vue";
import type { LogicSigAccount } from "algosdk";

export default defineComponent({
	name: "ProposalInfo",
	components: {
		VotePage,
		PieChart,
	},
	data() {
		let proposalInfo: ProposalTableData | undefined;
		if (this.$route.query.data) {
			proposalInfo = JSON.parse(this.$route.query.data.toString());
		}

		return {
			ProposalType,
			proposalInfo,
		};
	},
	setup() {
		const daoStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());

		return {
			walletStore,
			daoStore,
			DateTimeFormat,
			secToFormat,
		};
	},
	methods: {
		async handleWithdrawProposalAction() {
			// TODO: Add withdraw proposal action
			console.log("Proposal withdraw");
			if (
				this.daoStore.dao_id &&
				this.walletStore.address &&
				this.daoStore.govt_id &&
				this.proposalInfo
			) {
				const lsig: LogicSigAccount = await getProposalLsig(
					this.daoStore.dao_id,
					this.walletStore.address
				);
				withdrawProposal(
					lsig,
					this.walletStore.address, // proposer address
					10,
					this.daoStore.govt_id,
					this.walletStore.webMode
				);
			}
		},
		async handleExecuteProposalAction() {
			if (
				this.daoStore.dao_id &&
				this.walletStore.address &&
				this.proposalInfo
			) {
				const lsig: LogicSigAccount = await getProposalLsig(
					this.daoStore.dao_id,
					this.walletStore.address
				);
				executeProposal(
					this.walletStore.address,
					lsig.address(),
					this.daoStore.dao_id,
					this.proposalInfo,
					this.walletStore.webMode
				);
			}
		},
	},
});
</script>
