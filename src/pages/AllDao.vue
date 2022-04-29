<template>
	<a-row>
		<a-col :span="12" :offset="6">
			<div v-if="error">
				<a-alert
					message="Error"
					:description="error"
					type="error"
					show-icon
					closable
					@close="error = ''"
				/>
			</div>
			<div v-else>
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

					<a-form-item :wrapper-col="{ offset: 12, span: 20 }">
						<a-button type="primary" html-type="submit">Select</a-button>
					</a-form-item>
				</a-form>
			</div>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import { VALIDATE_MESSAGES } from "@/constants/constant";
import { searchApplicationAndAccount } from "@/indexer";
import { defineComponent, reactive } from "vue";
import DaoStore from "../store/DaoID";

export default defineComponent({
	name: "AllDao",
	data() {
		return {
			error: "",
		};
	},
	methods: {
		onFinish() {
			searchApplicationAndAccount().catch((error) => {
				this.error = error.message;
			});
		},
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
	},
	setup() {
		const formState = reactive(DaoStore());

		return {
			formState,
			validateMessages: VALIDATE_MESSAGES,
		};
	},
});
</script>

<style></style>
