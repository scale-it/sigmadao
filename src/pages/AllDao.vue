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
import { searchForApplication } from "@/indexer";
import { defineComponent } from "vue";
import DaoIDStore from "../store/DaoID";

export default defineComponent({
	name: "AllDao",
	setup() {
		const formState = DaoIDStore();

		const onFinish = (values: any) => {
			formState.setDaoID(+values.dao_id);
			searchForApplication(+values.dao_id);
		};
		const onFinishFailed = (errorinfo: Event) => {
			console.warn("Failed:", errorinfo);
		};

		const validateMessages = {
			required: "required!",
			types: {
				number: "It is is not a valid number!",
			},
		};

		return {
			onFinish,
			onFinishFailed,
			formState,
			validateMessages,
		};
	},
});
</script>

<style></style>
