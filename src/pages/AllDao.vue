<template>
	<a-row>
		<a-col :span="12" :offset="6">
			<div v-if="error" class="margin_bottom_sm">
				<a-alert
					message="Error"
					:description="error"
					type="error"
					show-icon
					closable
					@close="error = ''"
				/>
			</div>
			<div>
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
import {
	daoAppMessage,
	errorMessage,
	loadingMessage,
	openSuccessNotificationWithIcon,
	SUCCESSFUL,
	successMessage,
	VALIDATE_MESSAGES,
} from "@/constants";
import { searchApplicationAndAccount } from "@/indexer";
import { defineComponent, reactive } from "vue";
import DaoStore from "../store/DaoID";
import { executeReq, ALL_DAOS_REQ } from "@/api";
import { DaoItemType } from "@/types";

export default defineComponent({
	name: "AllDao",
	data() {
		return {
			error: "",
			key: "DaoKey",
		};
	},
	methods: {
		onFinish() {
			loadingMessage(this.key);
			searchApplicationAndAccount()
				.then(() => {
					successMessage(this.key);
					openSuccessNotificationWithIcon(
						SUCCESSFUL,
						daoAppMessage.SUCCESSFUL(this.formState.dao_id as number)
					);
				})
				.catch((error) => {
					errorMessage(this.key);
					this.error = error.message;
				});
		},
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
	},
	setup() {
		const formState = reactive(DaoStore());
		// Get all daos
		executeReq(ALL_DAOS_REQ)
			.then((res) => {
				if (res && res.Daos && res.Daos.length) {
					res.Daos.map((item: DaoItemType) => {
						if (item.app_params) {
							item.app_params = JSON.parse(item.app_params);
						}
						return item;
					});
					console.log(res.Daos);
				}
			})
			.catch((err) => console.error(err));
		return {
			formState,
			validateMessages: VALIDATE_MESSAGES,
		};
	},
});
</script>

<style></style>
