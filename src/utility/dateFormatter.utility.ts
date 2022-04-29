import { MILLI_SECOND } from "../constants/constant";

export const convertToSeconds = (value: number | string | Date) => {
	return new Date(value).getTime() / MILLI_SECOND;
};
