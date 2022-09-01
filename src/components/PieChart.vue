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
	},
	setup(props) {
		// TODO: Dynamic vote details fetch
		const chartData = {
			labels: ["Yes", "No", "Abstain"],
			datasets: [
				{
					backgroundColor: [VOTE_YES, VOTE_NO, VOTE_ABSTAIN],
					data: [40, 20, 10],
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
			});
	},
});
</script>
