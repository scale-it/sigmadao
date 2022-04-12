<template>
	<a-row>
		<a-col :span="12" :offset="6">
			<a-form
				:label-col="{ span: 12 }"
				:wrapper-col="{ span: 12 }"
				:model="formState"
				name="All Dao"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item
					label="Select DAO"
					name="dao_id"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.dao_id" />
				</a-form-item>

				<a-form-item :wrapper-col="{ offset: 10, span: 20 }">
					<a-button type="primary" html-type="submit">Select</a-button>
				</a-form-item>
			</a-form>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import { validateMessages } from "@/constants/constant";
import { searchForApplication } from "@/indexer";
import { defineComponent, reactive } from "vue";
import DaoIDStore from "../store/DaoID";

export default defineComponent({
	name: "AllDao",
	methods: {
		onFinish(values: any) {
			this.formState.setDaoID(+values.dao_id);
			searchForApplication(+values.dao_id);
		},
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
	},
	setup() {
		const formState = reactive(DaoIDStore());

		return {
			formState,
			validateMessages,
		};
	},
});
</script>

<style></style>
