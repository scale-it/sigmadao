<template>
	<template v-if="!optedInDaoApp">
		<a-col :span="12" :offset="6">
			<a-alert
				message="Error"
				:description="NOT_OPTED_IN"
				type="error"
				show-icon
			/>
		</a-col>
	</template>
	<template v-else>
		<slot></slot>
	</template>
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import DaoID from "@/store/DaoID";
import { NOT_OPTED_IN } from "@/constants";

export default defineComponent({
	name: "OptInError",
	data() {
		const daoIDStore = reactive(DaoID());
		return {
			optedInDaoApp: !daoIDStore.show_opt_in,
			NOT_OPTED_IN,
		};
	},
});
</script>
