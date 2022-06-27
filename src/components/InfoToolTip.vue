<template>
	<a-popover>
		<template #content>
			<p>
				{{ data }}
			</p>
		</template>
		<info-circle-outlined :style="'color:' + INFO_ICON_COLOR" />
	</a-popover>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { InfoCircleOutlined } from "@ant-design/icons-vue";
import { INFO_ICON_COLOR } from "@/constants";

export default defineComponent({
	name: "InfoToolTip",
	components: {
		InfoCircleOutlined,
	},
	props: ["data"],
	data() {
		return {
			INFO_ICON_COLOR,
		};
	},
});
</script>
