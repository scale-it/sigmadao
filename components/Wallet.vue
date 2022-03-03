<template>
	<div>
		<a-row type="flex" justify="center">
			<a-col :span="12">
				<a-dropdown>
					<template #overlay>
						<a-menu @click="handleMenuClick">
							<a-menu-item key="1"> Algosigner </a-menu-item>
							<a-menu-item key="2"> Wallet Connect </a-menu-item>
							<a-menu-item key="3"> My Algo Wallet </a-menu-item>
						</a-menu>
					</template>
					<a-button>
						Select your wallet
						<DownOutlined />
					</a-button>
				</a-dropdown>
			</a-col>
		</a-row>
		<a-row type="flex" justify="center">
			<a-col :span="12">Address: {{ walletAddress }}</a-col>
		</a-row>
	</div>
</template>

<script lang="ts">
import { DownOutlined } from "@ant-design/icons-vue";
export default defineComponent({
	data() {
		return {
			walletAddress: "Not Found",
		};
	},
	components: {
		DownOutlined,
	},
	setup() {
		const handleMenuClick: MenuProps["onClick"] = (e) => {
			console.log("click", e);
		};
		return {
			handleMenuClick,
		};
	},
});
</script>
