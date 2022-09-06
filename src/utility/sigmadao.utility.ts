import { EndPoint } from "../types";
import { Router } from "vue-router";
import { DEFAULT_FUND_AMT } from "@/constants";
import { Rule } from "ant-design-vue/lib/form";

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

export const validateFundAmount = (
	_rule: Rule,
	value: string,
	formValue: number | undefined
) => {
	if (value === null) {
		return Promise.reject("Please input the fund amount.");
	} else {
		if (formValue !== undefined && formValue < DEFAULT_FUND_AMT) {
			return Promise.reject(
				`Minimum funding of ${DEFAULT_FUND_AMT} algos is required for opt in and transactions fees.`
			);
		}
		return Promise.resolve();
	}
};
