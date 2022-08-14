<template>
	<a-row>
		<a-col :span="12" :offset="6">
			<p>
				{{ content }}
			</p>
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
