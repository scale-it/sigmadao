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
