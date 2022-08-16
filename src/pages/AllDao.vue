<template>
	<a-row class="dao-table" type="flex" justify="center">
		<div v-if="dataSource.length > 0" class="padding_inline_med">
			<a-list
				:grid="{ gutter: 25, xs: 1, sm: 2, column: 3, size: 'middle' }"
				:data-source="dataSource"
			>
				<template #header>
					<h3 style="text-align: center">Sigma DAOs</h3>
					<a-input-search
						enter-button
						style="width: 100% !important"
						placeholder="Search Daos"
						v-model:value="searchText"
						@search="handleFilterData()"
					/>
				</template>
				<template #renderItem="{ item }">
					<a-list-item class="margin_top_sm">
						<a-card
							:class="formState.dao_id === item.dao_id && 'selected_dao_card'"
							hoverable
							:title="item.name"
							@click="
								formState.dao_id !== item.dao_id
									? handleSelectDAO(item)
									: handleDeSelectDao(item)
							"
						>
							<template #extra>
								<div
									v-if="formState.dao_id === item.dao_id"
									style="color: #1890ff"
								>
									Selected
								</div></template
							>
							<a-descriptions :column="1">
								<a-descriptions-item label="App ID">{{
									item.dao_id
								}}</a-descriptions-item>
								<a-descriptions-item label="Token Name">{{
									item.token_name
								}}</a-descriptions-item>
								<a-descriptions-item label="Token ID">{{
									item.token_id
								}}</a-descriptions-item>
								<a-descriptions-item label="Link">
									<a :href="'//' + item.link" target="_blank">
										{{ item.link }}
									</a>
								</a-descriptions-item>
							</a-descriptions>
						</a-card>
					</a-list-item>
				</template>
			</a-list>
		</div>
		<div v-else-if="dataLoading" class="spinner_container">
			<a-spin size="large" />
			<h4 class="margin_left_sm">Fetching Data</h4>
		</div>
		<div v-else>
			<a-empty description="No Sigma DAOs Exists">
				<a-button type="primary" @click="handleCreateDAO">Create</a-button>
			</a-empty>
		</div>
	</a-row>
	<div class="flex_end">
		<TablePagination
			v-bind:totalDataRowsCount="totalDataRowsCount"
			:paginationHandler="handlePaginationCall"
		/>
	</div>
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
import { defineComponent, reactive } from "vue";
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
import TablePagination from "../UIKit/TablePagination.vue";
import { redirectTo } from "@/utility";

export default defineComponent({
	name: "AllDao",
	components: {
		TablePagination,
	},
	data() {
		return {
			key: "DaoKey",
			dataLoading: false,
			searchText: "",
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
					dynamicCallback(ROWS_PER_PAGE, null, null, null);
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
		handleCreateDAO() {
			redirectTo(this.$router, EndPoint.CREATE_DAO);
		},
		handleDeSelectDao() {
			this.formState.resetDaoStore();
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
			startCursor: string | null
		) {
			this.dataLoading = true;
			const res = await executeReq(
				getAllDaoReq(first, endCursor, last, startCursor)
			).catch((error) => {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				this.dataLoading = false;
			});
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
			this.dataLoading = false;
		},
		async handleDaoNameSearch(
			first: number | null,
			endCursor: string | null,
			last: number | null,
			startCursor: string | null
		) {
			this.dataLoading = true;
			const response = await handleDaoSearch(
				SearchDaoType.SEARCH_BY_DAO_NAME,
				this.searchText,
				first,
				endCursor,
				last,
				startCursor
			).catch((error) => {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				this.dataLoading = false;
			});
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
			this.dataLoading = false;
		},
	},
	setup() {
		const formState = reactive(DaoStore());
		return {
			formState,
			validateMessages: VALIDATE_MESSAGES,
		};
	},
	mounted() {
		this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
	},
});
</script>
