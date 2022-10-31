<template>
	<a-row>
		<a-col :xs="{ span: 20, offset: 2 }" :sm="{ span: 14, offset: 6 }">
			<p style="text-align: justify" v-html="content"></p>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "SigmaDaoDescription",
	props: ["content"],
});
</script>
