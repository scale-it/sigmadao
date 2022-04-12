<template>
	<a-row>
		<a-col :span="12" :offset="6">
			<a-form
				:label-col="{ span: 12 }"
				:wrapper-col="{ span: 12 }"
				:model="formState"
				name="Vote"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item
					label="Proposal ID"
					name="proposal_id"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.proposal_id" />
				</a-form-item>
				<a-form-item label="Vote" name="vote" :rules="[{ required: true }]">
					<a-select
						v-model:value="formState.vote"
						placeholder="Please select your option"
					>
						<a-select-option :value="VoteOptions.ABSTAIN"
							>Abstain</a-select-option
						>
						<a-select-option :value="VoteOptions.YES">Yes</a-select-option>
						<a-select-option :value="VoteOptions.NO">No</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item :wrapper-col="{ offset: 10, span: 20 }">
					<a-button type="primary" html-type="submit">Submit</a-button>
				</a-form-item>
			</a-form>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import { storeToRefs } from "pinia";
import { defineComponent } from "vue";
import VoteStore from "../store/VoteStore";
import { VoteOptions } from "../types/enum.types";

export default defineComponent({
	name: "AddProposal",
	data() {
		return {
			VoteOptions,
		};
	},
	setup() {
		const formState = storeToRefs(VoteStore());

		const onFinish = (values: Event) => {
			console.log("Success:", values);
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
