<template>
	<div class="app_root">
		<AppHeader />
		<router-view />
		<AppFooter />
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";

export default defineComponent({
	name: "App",
	components: { AppHeader, AppFooter },
});
</script>

<style>
html {
	font-size: 62.5%;
}

@media only screen and (max-width: 75em) {
	html {
		font-size: 56.25%;
	}
}

@media only screen and (max-width: 56.25em) {
	html {
		font-size: 50%;
	}
}

@media only screen and (min-width: 112.5em) {
	html {
		font-size: 75%;
	}
}
.app_root {
	max-width: 120rem;
	margin: auto;
}
</style>
