import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import AddProposal from "../pages/Proposal.vue";
import VotePage from "../pages/Vote.vue";
import AllDao from "../pages/AllDao.vue";
import { EndPoint } from "@/types";

const routes = [
	{
		path: "/",
		name: "HomePage",
		component: HomePage,
	},
	{
		path: EndPoint.ALL_DAO,
		name: "AllDao",
		component: AllDao,
		props: true,
	},
	{
		path: EndPoint.ADD_PROPOSAL,
		name: "AddProposal",
		component: AddProposal,
		props: true,
	},
	{
		path: EndPoint.VOTE,
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
