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
			<a-button danger @click="connectAlgoSigner">
				Connect AlgoSigner
			</a-button>
		</a-row>
		<a-row type="flex" justify="center">
			<a-col :span="12">Address: {{ walletAddress }}</a-col>
		</a-row>
	</div>
</template>

<script lang="ts">
import { DownOutlined } from "@ant-design/icons-vue";
import { CHAIN_NAME } from "../config/algosigner.config";
import { defineComponent } from "vue";
declare var AlgoSigner: any; // eslint-disable-line

export default defineComponent({
	components: {
		DownOutlined,
	},
	data() {
		return {
			walletAddress: "Not Found",
		};
	},
	methods: {
		async connectAlgoSigner() {
			try {
				const algoSignerResponse = await AlgoSigner.connect({
					ledger: CHAIN_NAME,
				});
				console.log("Connected to AlgoSigner:", algoSignerResponse);
				await this.getUserAccount();
			} catch (e) {
				console.error(e);
			}
		},
		async getUserAccount() {
			const userAccount = await AlgoSigner.accounts({
				ledger: CHAIN_NAME,
			});
			if (userAccount && userAccount.length) {
				this.walletAddress = userAccount[0].address;
			}
		},
		handleMenuClick(e: Event) {
			console.error("changing wallet kind", e);
		},
	},
});
</script>
