import { EndPoint } from "../types";
import { Router } from "vue-router";

/**
 * Method to redirect user
 * @param router reference to router object
 * @param path path where user has to be redirected
 */
export const redirectTo = (router: Router, path: EndPoint) => {
	router.push({ path: path });
};

/**
 * Method to calculate percentage
 * @param value the value whose percentage to be calculated
 * @param total total value
 */
export const calculatePercentage = (value: number, total: number): number => {
	return total > 0 ? (value / total) * 100 : 0.0;
};
