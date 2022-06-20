import { DurationType } from "@/types";
import {
	DAY_TO_SECONDS,
	HOUR_TO_SECONDS,
	MILLI_SECOND,
	MINUTE_TO_SECONDS,
} from "@/constants";

export const convertToSeconds = (value: number | string | Date) => {
	return new Date(value).getTime() / MILLI_SECOND;
};

export const convertDurationTypeToSeconds = (
	type: DurationType,
	value: number
): number => {
	switch (type) {
		case DurationType.DAYS:
			return value * DAY_TO_SECONDS;
		case DurationType.HOURS:
			return value * HOUR_TO_SECONDS;
		case DurationType.MINUTES:
			return value * MINUTE_TO_SECONDS;
		case DurationType.SECONDS:
			return value;
		default:
			return value;
	}
};
