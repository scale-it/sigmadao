<script lang="ts">
import { defineComponent, h, PropType } from "vue";
import { Pie } from "vue-chartjs";
import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	CategoryScale,
	Plugin,
} from "chart.js";
import { VOTE_YES, VOTE_NO, VOTE_ABSTAIN } from "../constants";
import { calculatePercentage } from "@/utility";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
export default defineComponent({
	name: "PieChart",
	components: {
		Pie,
	},
	props: {
		chartId: {
			type: String,
			default: "pie-chart",
		},
		width: {
			type: Number,
			default: 400,
		},
		height: {
			type: Number,
			default: 400,
		},
		cssClasses: {
			default: "",
			type: String,
		},
		styles: {
			type: Object as PropType<Partial<CSSStyleDeclaration>>,
			// eslint-disable-next-line
			default: () => {},
		},
		plugins: {
			type: Array as PropType<Plugin<"pie">[]>,
			default: () => [],
		},
		yesDeposit: {
			type: Number,
			default: 0,
		},
		noDeposit: {
			type: Number,
			default: 0,
		},
		abstainDeposit: {
			type: Number,
			default: 0,
		},
	},
	setup(props) {
		const totalDeposit =
			props.yesDeposit + props.noDeposit + props.abstainDeposit;
		const yesVotePercentage = calculatePercentage(
			props.yesDeposit,
			totalDeposit
		);
		const noVotePercentage = calculatePercentage(props.noDeposit, totalDeposit);
		const abstainVotePercentage = calculatePercentage(
			props.abstainDeposit,
			totalDeposit
		);

		const chartData = {
			labels: ["Yes ", "No ", "Abstain "],
			datasets: [
				{
					backgroundColor: [VOTE_YES, VOTE_NO, VOTE_ABSTAIN],
					data: [yesVotePercentage, noVotePercentage, abstainVotePercentage],
				},
			],
		};

		const chartOptions = {
			responsive: true,
			maintainAspectRatio: false,
		};

		return () =>
			h(Pie, {
				chartData,
				chartOptions,
				chartId: props.chartId,
				width: props.width,
				height: props.height,
				cssClasses: props.cssClasses,
				styles: props.styles,
				plugins: props.plugins,
				yesDeposit: props.yesDeposit,
				noDeposit: props.noDeposit,
				abstainDeposit: props.abstainDeposit,
			});
	},
});
</script>
