<template>
	<template v-if="!optedInDaoApp">
		<div>
			<a-alert
				message="Error"
				:description="NOT_OPTED_IN"
				type="error"
				show-icon
			/>
		</div>
	</template>
	<template v-else>
		<slot></slot>
	</template>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import DaoID from "@/store/DaoID";
import { NOT_OPTED_IN } from "@/constants";

export default defineComponent({
	name: "OptInError",
	data() {
		return {
			optedInDaoApp: !DaoID().show_opt_in,
			NOT_OPTED_IN,
		};
	},
});
</script>
