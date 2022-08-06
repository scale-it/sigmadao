<template>
	<a-row>
		<a-col :span="12" :offset="6">
			<p>
				In order to vote for proposals you have to deposit your tokens. This
				protects against double voting. Your token will be locked until end of
				the furthest proposal you voted (to be more specific, the token will be
				locked until
				<code>max({p \in proposal_you_voted; p.end_voting_end})</code>). After
				that time you can withdraw your tokens, or keep them locked to vote for
				other proposal.
			</p>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "TokenDescription",
});
</script>
