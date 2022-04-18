<template>
	<a-row>
		<a-col :span="12" :offset="6">
			<div v-if="error">
				<a-result status="error" title="Submission Failed" :sub-title="error">
				</a-result>
			</div>
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
import { searchForAccount, searchForApplication } from "@/indexer";
import WalletStore from "@/store/WalletStore";
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
		onFinish(values: any) {
			searchForApplication(+values.dao_id)
				.then((response) => {
					console.log("Global App Info:", response);
					if (response) {
						this.formState.global_app_state = response;
						this.formState.name = this.formState.global_app_state.get(
							"dao_name"
						) as string;
					}
				})
				.catch((error) => {
					this.error = error.message;
					setTimeout(() => {
						this.error = "";
					}, 1500);
				});
			const walletStore = WalletStore();
			if (walletStore.address) {
				searchForAccount(walletStore.address, +values.dao_id)
					.then((response) => {
						if (response.localStateMap) {
							this.formState.locked = response.localStateMap.get(
								"deposit"
							) as number;
							this.formState.available =
								response.total_amount - this.formState.locked;
						}
					})
					.catch((error) => {
						this.error = error.message;
						setTimeout(() => {
							this.error = "";
						}, 1500);
					});
			}
		},
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
	},
	setup() {
		const formState = reactive(DaoStore());

		return {
			formState,
			validateMessages,
		};
	},
});
</script>

<style></style>
