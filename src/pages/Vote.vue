<template>
	<div
		class="header_margin"
		:style="'--p-height: ' + headerHeight + 'px'"
	></div>
	<div class="mt flexBox flexBox_center">
		<form @submit="onSubmit">
			<label for="proposal_id">Proposal ID</label>
			<input id="proposal_id" required v-model="proposal_id" type="number" />
			<label for="vote_options">Vote</label>
			<select name="vote" id="vote_options" required v-model="vote">
				<option :value="VoteOptions.ABSTAIN">Abstain</option>
				<option :value="VoteOptions.YES">Yes</option>
				<option :value="VoteOptions.NO">No</option>
			</select>
			<button type="submit" class="submit_btn" @click="onSubmit">Submit</button>
		</form>
	</div>
</template>

<script lang="ts">
import { VoteFormState } from "@/types";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";
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
		const route = useRoute();
		console.log(route.params);
		const store = VoteStore();
		const formState = reactive<VoteFormState>(store);

		const onSubmit = () => {
			if (formState.proposal_id && formState.vote) {
				store.setFormValue(formState);
			}
		};
		const headerHeight = document.getElementById("header")?.offsetHeight;
		return {
			onSubmit,
			formState,
			headerHeight,
		};
	},
});
</script>

<style>
label {
	font-size: 16px;
	margin-block: 5px;
	font-weight: 500;
}
input {
	margin: 10px;
	min-width: 300px;
	min-height: 35px;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	margin: 0;
}

select {
	margin: 10px;
	min-width: 300px;
	min-height: 35px;
}

form {
	display: flex;
	flex-direction: column;
}

.submit_btn {
	width: fit-content;
	margin-block: 10px;
	background-color: #1890ff;
	color: white;
	border-radius: 3px;
	padding-block: 5px;
	padding-inline: 10px;
	box-shadow: 0 2px 0 rgb(0 0 0 / 5%);
	border-color: #1890ff;
}
</style>
