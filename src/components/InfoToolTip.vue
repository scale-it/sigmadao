<template>
	<a-popover>
		<template #content>
			<p>
				{{ data }}
			</p>
		</template>
		<info-circle-outlined style="color: #1890ff" />
	</a-popover>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { InfoCircleOutlined } from "@ant-design/icons-vue";

export default defineComponent({
	name: "InfoToolTip",
	components: {
		InfoCircleOutlined,
	},
	props: ["data"],
});
</script>
