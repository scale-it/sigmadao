<template>
	<div
		class="header_margin"
		:style="'--p-height: ' + headerHeight + 'px'"
	></div>
	<div class="mt flexBox flexBox_center">
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
	</div>
</template>

<script lang="ts">
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
		const formState = VoteStore();

		const onFinish = (values: any) => {
			console.log("Success:", values);
		};
		const onFinishFailed = (errorinfo: any) => {
			console.warn("Failed:", errorinfo);
		};

		const validateMessages = {
			required: "required!",
			types: {
				number: "It is is not a valid number!",
			},
		};

		const headerHeight = document.getElementById("header")?.offsetHeight;
		return {
			onFinish,
			onFinishFailed,
			formState,
			headerHeight,
			validateMessages,
		};
	},
});
</script>

<style></style>
