<template>
	<Pie :chart-data="chartData" :chart-options="chartOptions" />
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { Pie } from "vue-chartjs";
import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	CategoryScale,
} from "chart.js";
import { VOTE_YES, VOTE_NO, VOTE_ABSTAIN } from "../constants";
import { calculatePercentage } from "@/utility";
import ProposalStore from "@/store/ProposalStore";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
export default defineComponent({
	name: "PieChart",
	components: {
		Pie,
	},

	computed: {
		chartData() {
			const yesDeposit = this.proposalStore.yes ?? 0;
			const noDeposit = this.proposalStore.no ?? 0;
			const abstainDeposit = this.proposalStore.abstain ?? 0;
			const totalDeposit = yesDeposit + noDeposit + abstainDeposit;
			const yesVotePercentage = calculatePercentage(yesDeposit, totalDeposit);
			const noVotePercentage = calculatePercentage(noDeposit, totalDeposit);
			const abstainVotePercentage = calculatePercentage(
				abstainDeposit,
				totalDeposit
			);

			return {
				labels: ["Yes ", "No ", "Abstain "],
				datasets: [
					{
						backgroundColor: [VOTE_YES, VOTE_NO, VOTE_ABSTAIN],
						data: [yesVotePercentage, noVotePercentage, abstainVotePercentage],
					},
				],
			};
		},
	},
	setup() {
		const proposalStore = reactive(ProposalStore());
		const chartOptions = {
			responsive: true,
			maintainAspectRatio: false,
		};

		return {
			proposalStore,
			chartOptions,
		};
	},
});
</script>
