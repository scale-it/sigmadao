<template>
	<a-row v-if="isProposalExecuted()">
		<a-col :xs="{ span: 20, offset: 2 }" :sm="{ span: 14, offset: 6 }">
			<a-result
				status="success"
				title="Proposal has been successfully executed."
				sub-title=""
			>
			</a-result>
		</a-col>
	</a-row>
	<a-row type="flex" justify="start">
		<a-col :xs="{ span: 24 }" :lg="{ span: 9 }">
			<a-card title="Proposal Details">
				<a-descriptions :column="1">
					<a-descriptions-item label="Name">{{
						proposalInfo.name
					}}</a-descriptions-item>
					<a-descriptions-item label="Voting Start">{{
						secToFormat(
							proposalInfo.voting_start,
							DateTimeFormat.DAY_TIME_WITH_DAY
						)
					}}</a-descriptions-item>
					<a-descriptions-item label="Voting End">{{
						secToFormat(
							proposalInfo.voting_end,
							DateTimeFormat.DAY_TIME_WITH_DAY
						)
					}}</a-descriptions-item>
					<a-descriptions-item label="Execute Before">{{
						secToFormat(
							proposalInfo.execute_before,
							DateTimeFormat.DAY_TIME_WITH_DAY
						)
					}}</a-descriptions-item>
					<a-descriptions-item label="URL">
						<a :href="'//' + proposalInfo.url" target="_blank">
							{{ proposalInfo.url }}
						</a></a-descriptions-item
					>
					<a-descriptions-item label="URL Hash">{{
						proposalInfo.url_hash
					}}</a-descriptions-item>

					<a-descriptions-item label="Type">{{
						ProposalType[proposalInfo.type]
					}}</a-descriptions-item>
					<a-descriptions-item v-if="proposalInfo.from" label="From">
						<address-copyable :walletAddress="proposalInfo.from" />
					</a-descriptions-item>
					<a-descriptions-item v-if="proposalInfo.recipient" label="Recipient">
						<address-copyable :walletAddress="proposalInfo.recipient" />
					</a-descriptions-item>
					<a-descriptions-item v-if="proposalInfo.amount" label="Amount">
						{{ getAlgoAmount(proposalInfo) }}</a-descriptions-item
					>
					<a-descriptions-item v-if="proposalInfo.asa_id" label="ASA ID">{{
						proposalInfo.asa_id
					}}</a-descriptions-item>
				</a-descriptions>
			</a-card>
		</a-col>
		<a-col :xs="{ span: 24 }" :lg="{ span: 13, offset: 2 }">
			<a-card title="Vote" style="width: 400px">
				<PieChart />
			</a-card>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import { ProposalType } from "@/constants";
import { defineComponent, reactive } from "vue";
import { redirectTo, secToFormat } from "../utility";
import { DateTimeFormat, EndPoint, ProposalTableData } from "@/types";
import PieChart from "../components/PieChart.vue";
import ProposalStore from "@/store/ProposalStore";
import AddressCopyable from "@/UIKit/Address.vue";
import DaoID from "@/store/DaoID";

export default defineComponent({
	name: "ProposalInfo",
	components: {
		PieChart,
		AddressCopyable,
	},
	data() {
		return {
			ProposalType,
		};
	},
	methods: {
		isProposalExecuted() {
			if (this.proposalInfo.executed === 1) {
				return true;
			}
			return false;
		},
		redirectToAllProposal() {
			redirectTo(this.$router, EndPoint.PROPOSALS);
		},
		getAlgoAmount(item: ProposalTableData) {
			if (item.type === ProposalType.ALGO_TRANSFER) {
				return (item.amount as number) / 1e6;
			}
			return item.amount;
		},
	},
	setup() {
		const proposalInfo = reactive(ProposalStore());
		const daoStore = reactive(DaoID());

		return {
			DateTimeFormat,
			secToFormat,
			proposalInfo,
			daoStore,
		};
	},
});
</script>
