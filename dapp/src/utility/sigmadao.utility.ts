import { EndPoint } from "../types";
import { Router } from "vue-router";
import { DEFAULT_FUND_AMT } from "@/constants";
import { Rule } from "ant-design-vue/lib/form";
import { isValidAddress } from "algosdk";

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
	formValue?: number
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

/**
 * Validate the Algorand Address
 * @param _rule the antd rules
 * @param addr Address
 */
export const validateAlgorandAddress = (
	_rule: Rule,
	addr: string,
) => {
	if (!addr) {
		return Promise.reject(
			`Please input the address.`
		);
	}
	if (!isValidAddress(addr)) {
		return Promise.reject(
			`Please provide valid address.`
		);
	}
	return Promise.resolve();
};
export const getTruncatedAddress = (addr: string, places: number): string => {
	return addr.substring(0, places) + "..." + addr.slice(-places);
}
