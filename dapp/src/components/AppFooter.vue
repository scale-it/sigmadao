<template>
	<div class="bottom_center">
		<p>© 2022 Algo Builder - All Rights Reserved</p>
		<div>
			<h3 class="margin_top_large">
				Powered by
				<a :href="ALGO_BUILDER_URL" target="_blank">
					<img class="algo_builder_img" src="../assets/algo-builder-logo.png"
				/></a>
			</h3>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ALGO_BUILDER_URL } from "@/constants";

export default defineComponent({
	data() {
		return {
			ALGO_BUILDER_URL,
		};
	},
});
</script>
