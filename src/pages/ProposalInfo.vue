<template>
	<a-breadcrumb class="margin_bottom_sm">
		<a-breadcrumb-item
			><a @click="redirectToAllProposal">All Proposals</a></a-breadcrumb-item
		>
		<a-breadcrumb-item>Proposal Info</a-breadcrumb-item>
	</a-breadcrumb>
	<ProposalDetailsTab :proposalInfo="proposalInfo" />
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
</template>

<script lang="ts">
import { ProposalType } from "@/constants";
import { defineComponent } from "vue";
import { secToFormat } from "../utility";
import { DateTimeFormat, ProposalTableData } from "@/types";
import PieChart from "../components/PieChart.vue";
import ProposalDetailsTab from "./ProposalDetailsTab.vue";

export default defineComponent({
	name: "ProposalInfo",
	components: {
		PieChart,
		ProposalDetailsTab,
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
		return {
			DateTimeFormat,
			secToFormat,
		};
	},
});
</script>
