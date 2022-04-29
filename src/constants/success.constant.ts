import { notification } from "ant-design-vue";

export const openSuccessNotificationWithIcon = (
	message: string,
	description: string
) => {
	notification["success"]({
		message: message,
		description: description,
		duration: 0, // to close only when user prompts close button
		onClose: () => notification.close(""),
	});
};
