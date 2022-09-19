<template>
	<a-row type="flex" justify="center">
		<a-col align="middle">
			<img src="../assets/404.png" class="logo" />
			<a-typography>
				<a-typography-title>Sorry, Page Not Found</a-typography-title>
			</a-typography>
			<router-link :to="{ path: EndPoint.ALL_DAO }">
				<a-button type="primary">
					Go To Home Page
					<template #icon><arrow-left-outlined /></template>
				</a-button>
			</router-link>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { EndPoint } from "@/types";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";

export default defineComponent({
	name: "PageNotFound",
	components: {
		ArrowLeftOutlined,
	},
	data() {
		return {
			EndPoint,
		};
	},
});
</script>
