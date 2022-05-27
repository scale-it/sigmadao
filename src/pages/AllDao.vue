<template>
	<div class="dao_table_container">
		<a-table
			:dataSource="dataSource"
			:columns="columns"
			bordered
			:pagination="false"
		>
			<template #title>
				<a-col> <h3 style="text-align: center">Sigma DAOs</h3> </a-col>
			</template>
			<template #headerCell="{ column }">
				<template v-if="column.key === 'name'">
					<span class="clickable_text">Name</span>
				</template>
			</template>
			<template
				#customFilterDropdown="{
					setSelectedKeys,
					selectedKeys,
					confirm,
					clearFilters,
					column,
				}"
			>
				<div class="padding_sm">
					<a-input
						ref="searchInput"
						:placeholder="`Search ${column.dataIndex}`"
						:value="selectedKeys[0]"
						class="search_input"
						@change="(e) => handleInputChange(e, setSelectedKeys)"
						@pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
					/>
					<a-button
						type="primary"
						size="small"
						class="search_btn"
						@click="handleSearch(selectedKeys, confirm, column.dataIndex)"
					>
						<template #icon><SearchOutlined /></template>
						Search
					</a-button>
					<a-button
						size="small"
						class="reset_btn"
						@click="handleReset(clearFilters)"
						danger
					>
						Reset
					</a-button>
				</div>
			</template>
			<template #customFilterIcon="{ filtered }">
				<search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
			</template>

			<template #bodyCell="{ text, record, column }">
				<span v-if="searchText && searchedColumn === column.dataIndex">
					<template
						v-for="(fragment, i) in text
							.toString()
							.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
					>
						<mark
							v-if="fragment.toLowerCase() === searchText.toLowerCase()"
							:key="i"
							class="highlight"
						>
							{{ fragment }}
						</mark>
						<template v-else>{{ fragment }}</template>
					</template>
				</span>
				<template v-if="column.key === 'link'">
					<a :href="'//' + record.link" target="_blank">
						{{ record.link }}
					</a>
				</template>
				<template v-if="column.key === 'action'">
					<a-button
						type="link"
						v-if="formState.dao_id !== record.dao_id"
						@click="() => handleSelectDAO(record)"
					>
						Select
					</a-button>
					<a-button
						type="link"
						danger
						v-else
						@click="() => handleDeSelectDao(record)"
					>
						De-Select
					</a-button>
				</template>
			</template>
		</a-table>
	</div>
	<a-col :offset="15">
		<a-pagination
			:hideOnSinglePage="true"
			v-model:current="currentPage"
			:pageSize="ROWS_PER_PAGE"
			:total="totalDataRows"
			@change="(page) => handlePageChange(page)"
		/>
	</a-col>
</template>

<script lang="ts">
import {
	daoAppMessage,
	errorMessage,
	GLOBAL_STATE_MAP_KEY,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	ROWS_PER_PAGE,
	SUCCESSFUL,
	successMessage,
	UNSUCCESSFUL,
	VALIDATE_MESSAGES,
} from "@/constants";
import {
	decodeAppParamsState,
	getAssetInformation,
	isApplicationOpted,
	searchApplicationAndAccount,
} from "@/indexer";
import { defineComponent, reactive, ref, toRefs } from "vue";
import DaoStore from "../store/DaoID";
import { executeReq, getAllDaoReq } from "@/api";
import { DaoTableData } from "@/types";
import WalletStore from "@/store/WalletStore";
import { SearchOutlined } from "@ant-design/icons-vue";

export default defineComponent({
	name: "AllDao",
	components: {
		SearchOutlined,
	},
	data() {
		return {
			key: "DaoKey",
			columns: [
				{
					title: "Dao App ID",
					key: "dao_id",
					dataIndex: "dao_id",
				},
				{
					title: "Name",
					key: "name",
					dataIndex: "name",
					customFilterDropdown: true,
					onFilter: (value: string, record: DaoTableData) =>
						this.handleFilterData(value, record),
					onFilterDropdownVisibleChange: (visible: boolean) => {
						if (visible && this.$refs.searchInput) {
							setTimeout(() => {
								(this.$refs.searchInput as any).focus();
							}, 100);
						}
					},
				},
				{
					title: "Token Name",
					key: "token_name",
					dataIndex: "token_name",
				},
				{
					title: "Token ID",
					key: "token_id",
					dataIndex: "token_id",
				},
				{
					title: "Link to DAO",
					key: "link",
					dataIndex: "link",
				},
				{
					title: "Action",
					key: "action",
				},
			],
			walletStore: WalletStore(),
			currentPage: ref(1),
			totalDataRows: ROWS_PER_PAGE,
			ROWS_PER_PAGE,
		};
	},
	methods: {
		handlePageChange(page: number) {
			this.fetchDataForDAO(page);
		},
		handleSelectDAO(data: DaoTableData) {
			this.formState.govt_id = data.token_id;
			this.formState.dao_id = data.dao_id;
			loadingMessage(this.key);
			searchApplicationAndAccount()
				.then(() => {
					successMessage(this.key);
					openSuccessNotificationWithIcon(
						SUCCESSFUL,
						daoAppMessage.SUCCESSFUL(data.dao_id)
					);
					if (this.walletStore.address) {
						isApplicationOpted(this.walletStore.address, data.dao_id)
							.then((appIsOptedIn: boolean) => {
								this.formState.show_opt_in = !appIsOptedIn;
								if (appIsOptedIn) {
									openSuccessNotificationWithIcon(daoAppMessage.ALREADY_OPT_IN);
								}
							})
							.catch((error) =>
								openErrorNotificationWithIcon(
									daoAppMessage.UNSUCCESFUL,
									error.message
								)
							);
					}
				})
				.catch((error) => {
					errorMessage(this.key);
					openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				});
		},
		handleDeSelectDao() {
			this.formState.resetDaoStore();
		},
		handleSearch(
			selectedKeys: string[],
			confirm: (param?: any) => void,
			dataIndex: string
		) {
			confirm();
			this.searchText = selectedKeys[0];
			this.searchedColumn = dataIndex;
		},
		handleReset(clearFilters: (param: any) => void) {
			clearFilters({ confirm: true });
			this.searchText = "";
		},
		handleInputChange(
			e: any,
			setSelectedKeys: (selectedKeys: string[]) => void
		) {
			setSelectedKeys(e.target.value ? [e.target.value] : []);
		},
		handleFilterData(value: string, record: DaoTableData) {
			return record.name.toString().toLowerCase().includes(value.toLowerCase());
		},
		fetchDataForDAO(currentPage: number) {
			executeReq(getAllDaoReq(currentPage, ROWS_PER_PAGE))
				.then((res) => {
					if (res && res.DaoAndPage) {
						if (res.DaoAndPage.Daos.length) {
							const temp: Array<DaoTableData> = [];
							this.formState.psqlData = temp;
							res.DaoAndPage.Daos.map(async (item: any, index: number) => {
								if (item.app_params) {
									item.app_params = JSON.parse(item.app_params);
								}
								const globalState = decodeAppParamsState(item.app_params.dt.gd);
								const tokenData = await getAssetInformation(item.asset_id);
								this.formState.psqlData.push({
									key: index,
									dao_id: item.app_id,
									token_id: item.asset_id,
									token_name: tokenData.name as string,
									name: globalState.get(GLOBAL_STATE_MAP_KEY.DaoName) as string,
									link: globalState.get(GLOBAL_STATE_MAP_KEY.Url) as string,
								});
							});
						}
						// setting it only at first call since it doesn't change i.e for page 1
						if (currentPage === 1 && res.DaoAndPage.pageInfo) {
							this.totalDataRows = res.DaoAndPage.pageInfo.totalDaos;
						}
					}
				})
				.catch((error) =>
					openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
				);
		},
	},
	setup() {
		const formState = reactive(DaoStore());
		const state = reactive({
			searchText: "",
			searchedColumn: "",
		});
		const searchInput = ref();
		const tempArray: Array<DaoTableData> = [];
		formState.psqlData = tempArray; // prohibit duplication of data

		return {
			formState,
			validateMessages: VALIDATE_MESSAGES,
			dataSource: formState.psqlData,
			searchInput,
			...toRefs(state),
		};
	},
	mounted() {
		this.fetchDataForDAO(1);
	},
});
</script>
