import { message, notification } from "ant-design-vue";

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

export const LoadingMessage = (key: string) => {
	message.loading({ content: "Loading...", key: key });
};

export const SuccessMessage = (key: string) => {
	message.loading({ content: "Loaded", key: key });
};
