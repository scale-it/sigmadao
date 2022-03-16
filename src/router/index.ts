import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import AddProposal from "../pages/Proposal.vue";
import VotePage from "../pages/Vote.vue";

const routes = [
	{
		path: "/",
		name: "HomePage",
		component: HomePage,
	},
	{
		path: "/addProposal",
		name: "AddProposal",
		component: AddProposal,
		props: true,
	},
	{
		path: "/vote",
		name: "VotePage",
		component: VotePage,
		props: true,
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
