<template>
	<div class="table_container">
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
		<TablePagination
			v-bind:totalDataRowsCount="totalDataRowsCount"
			:paginationHandler="handlePaginationCall"
		/>
	</a-col>
</template>

<script lang="ts">
import {
	daoAppMessage,
	errorMessage,
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
	decodeDaoAppParams,
	handleDaoSearch,
	isApplicationOpted,
	searchApplicationAndAccount,
} from "@/indexer";
import { defineComponent, reactive, ref, toRefs } from "vue";
import DaoStore from "../store/DaoID";
import {
	executeReq,
	getAllDaoReq,
	getCursorReq,
	getDaoInfoByAppNameCursorReq,
} from "@/api";
import {
	DaoTableData,
	PaginationCallType,
	EndPoint,
	SearchDaoType,
} from "@/types";
import WalletStore from "@/store/WalletStore";
import { SearchOutlined } from "@ant-design/icons-vue";
import TablePagination from "../UIKit/TablePagination.vue";
import { redirectTo } from "@/utility";

export default defineComponent({
	name: "AllDao",
	components: {
		SearchOutlined,
		TablePagination,
	},
	data() {
		return {
			key: "DaoKey",
			columns: [
				{
					title: "DAO App ID",
					key: "dao_id",
					dataIndex: "dao_id",
				},
				{
					title: "Name",
					key: "name",
					dataIndex: "name",
					customFilterDropdown: true,
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
			totalDataRowsCount: ROWS_PER_PAGE,
			ROWS_PER_PAGE,
			dataSource: [] as DaoTableData[],
			currentPageCursor: {
				endCursor: null,
				startCursor: null,
			},
			PaginationCallType,
			EndPoint,
			isFilterActive: false,
		};
	},
	methods: {
		handlePaginationCall(type: PaginationCallType, pageNumber?: string) {
			// calls handleDaoNameSearch if user is using filter else fetchDaoData
			const dynamicCallback =
				this.isFilterActive && this.searchText
					? this.handleDaoNameSearch
					: this.fetchDaoData;
			switch (type) {
				case PaginationCallType.NAV_PREV:
					dynamicCallback(
						null,
						null,
						ROWS_PER_PAGE,
						this.currentPageCursor.startCursor
					);
					break;
				case PaginationCallType.NAV_NEXT:
					dynamicCallback(
						ROWS_PER_PAGE,
						this.currentPageCursor.endCursor,
						null,
						null
					);
					break;
				case PaginationCallType.JUMP_PAGE:
					this.handlePageJump(pageNumber as string);
					break;
				case PaginationCallType.FIRST_PAGE:
					dynamicCallback(ROWS_PER_PAGE, null, null, null, 1);
					break;
			}
		},
		async handlePageJump(pageNumber: string) {
			if (+pageNumber === 1) {
				this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
			} else {
				if (this.isFilterActive && this.searchText) {
					await this.getDaoNameCursorDetails(+pageNumber);
				} else {
					await this.getCursorDetails(+pageNumber);
				}
				this.handlePaginationCall(PaginationCallType.NAV_NEXT);
			}
		},
		async getDaoNameCursorDetails(pageNumber: number) {
			const cursorRes = await executeReq(
				getDaoInfoByAppNameCursorReq(this.searchText, pageNumber, ROWS_PER_PAGE)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);
			if (cursorRes?.searchSigmaDaos?.pageInfo) {
				const pageInfo = cursorRes.searchSigmaDaos.pageInfo;
				this.currentPageCursor.endCursor = pageInfo.endCursor;
				this.currentPageCursor.startCursor = pageInfo.startCursor;
			}
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
						daoAppMessage.DAO_SUCCESSFUL(data.dao_id)
					);
					redirectTo(this.$router, EndPoint.ADD_PROPOSAL);
					DaoStore().searchDaoId = data.dao_id;
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
									daoAppMessage.DAO_UNSUCCESFUL,
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
			this.handleFilterData();
		},
		handleReset(clearFilters: (param: any) => void) {
			this.isFilterActive = false;
			this.searchText = "";
			clearFilters({ confirm: true });
			this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
		},
		handleInputChange(
			e: any,
			setSelectedKeys: (selectedKeys: string[]) => void
		) {
			setSelectedKeys(e.target.value ? [e.target.value] : []);
		},
		handleFilterData() {
			this.isFilterActive = true;
			this.dataSource = [];
			this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
		},
		async getCursorDetails(pageNumber: number) {
			const cursorRes = await executeReq(
				getCursorReq(pageNumber, ROWS_PER_PAGE)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);

			if (cursorRes?.allSigmaDaos?.pageInfo) {
				const pageInfo = cursorRes.allSigmaDaos.pageInfo;
				this.currentPageCursor.endCursor = pageInfo.endCursor;
				this.currentPageCursor.startCursor = pageInfo.startCursor;
			}
		},
		async fetchDaoData(
			first: number | null,
			endCursor: string | null,
			last: number | null,
			startCursor: string | null,
			currentPage?: number
		) {
			const res = await executeReq(
				getAllDaoReq(first, endCursor, last, startCursor)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);
			if (res && res.allSigmaDaos) {
				if (res.allSigmaDaos.nodes.length) {
					// clean existing data in temp array with change of page
					if (this.dataSource.length) {
						this.dataSource = [];
					}
					res.allSigmaDaos.nodes.map(async (item: any, index: number) => {
						let parsedData = await decodeDaoAppParams(item);
						parsedData["key"] = index; // for antd table
						this.dataSource.push(parsedData);

						// pushing data to store only if it doesn't exists
						let isCached = false;
						isCached = this.formState.psqlData.has(+item.appId);
						if (!isCached) {
							this.formState.psqlData.set(+item.appId, parsedData);
						}
					});
				}

				if (res.allSigmaDaos.pageInfo) {
					const pageInfo = res.allSigmaDaos.pageInfo;
					this.currentPageCursor.startCursor = pageInfo.startCursor;
					this.currentPageCursor.endCursor = pageInfo.endCursor;
				}
				this.totalDataRowsCount = res.allSigmaDaos.totalCount;
			}
		},
		async handleDaoNameSearch(
			first: number | null,
			endCursor: string | null,
			last: number | null,
			startCursor: string | null
		) {
			const response = await handleDaoSearch(
				SearchDaoType.SEARCH_BY_DAO_NAME,
				this.searchText,
				first,
				endCursor,
				last,
				startCursor
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);
			if (response) {
				if (response.pageInfo) {
					const pageInfo = response.pageInfo;
					this.currentPageCursor.startCursor = pageInfo.startCursor;
					this.currentPageCursor.endCursor = pageInfo.endCursor;
				}
				this.dataSource = response.dataSource;

				if (response.totalCount) {
					this.totalDataRowsCount = response.totalCount;
				}
			}
		},
	},
	setup() {
		const formState = reactive(DaoStore());
		const state = reactive({
			searchText: "",
			searchedColumn: "",
		});
		const searchInput = ref();

		return {
			formState,
			validateMessages: VALIDATE_MESSAGES,
			searchInput,
			...toRefs(state),
		};
	},
	mounted() {
		this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
	},
});
</script>
