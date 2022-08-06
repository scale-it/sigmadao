import { DateTimeFormat, DurationType } from "@/types";
import { DAY_TO_SECONDS, HOUR_TO_SECONDS } from "@/constants";
import moment from "moment";

export const convertToSeconds = (value: number | string | Date) => {
	return moment(new Date(value)).unix();
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
		default:
			return value;
	}
};

export const secToFormat = (seconds: number, format: string) => {
	return moment.unix(seconds).format(format);
};

export const getDifferenceInSeconds = (
	dateOneInSeconds: number,
	dateTwoInSeconds: number
) => {
	const date1 = secToFormat(dateOneInSeconds, DateTimeFormat.DAY_TIME_WITH_DAY);
	const date2 = secToFormat(dateTwoInSeconds, DateTimeFormat.DAY_TIME_WITH_DAY);
	return moment(date2).diff(date1, "seconds");
};

export const toDaysMinutesSeconds = (totalSeconds: number) => {
	const seconds = Math.floor(totalSeconds % 60);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
	const days = Math.floor(totalSeconds / (3600 * 24));

	const secondsStr = makeHumanReadable(seconds, "second");
	const minutesStr = makeHumanReadable(minutes, "minute");
	const hoursStr = makeHumanReadable(hours, "hour");
	const daysStr = makeHumanReadable(days, "day");

	return `${daysStr}${hoursStr}${minutesStr}${secondsStr}`.replace(/,\s*$/, "");
};

export const makeHumanReadable = (num: number, singular: string) => {
	return num > 0
		? num + (num === 1 ? ` ${singular}, ` : ` ${singular}s, `)
		: "";
};
