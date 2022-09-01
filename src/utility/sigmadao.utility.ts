import { EndPoint } from "../types";
import { Router } from "vue-router";

/**
 * Method to redirect user
 * @param router reference to router object
 * @param path path where user has to be redirected
 * @param data the data to be passed in a router
 */
export const redirectTo = (router: Router, path: EndPoint, data?: any) => {
	if (data) {
		router.push({ path: path, query: { data: JSON.stringify(data) } });
	} else {
		router.push({ path });
	}
};
