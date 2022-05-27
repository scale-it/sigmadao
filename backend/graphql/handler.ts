import { executeQuery } from "../psql/queryExecute";
import { QUERY_GET_DAOS_COUNT, getPaginatedQuery } from "../psql/query";
import { DaosAndPageInfoType } from "./types";
import { DaoItemType, DaoArgType, DaoAndPageResType } from "../types";
const { GraphQLObjectType, GraphQLInt, GraphQLNonNull } = require("graphql");

const validateRes = (totalDaosRes: any, paginateRes: any, args: DaoArgType) => {
	return (
		totalDaosRes &&
		totalDaosRes.rows &&
		paginateRes &&
		paginateRes.rows &&
		paginateRes.rows.length &&
		args
	);
};

const getDaoPageRes = (
	totalDaos: number,
	daos: [DaoItemType],
	args: DaoArgType
): DaoAndPageResType => {
	const pageNumber = args.pageNumber; // page number = 1..n
	const pageSize = args.pageSize;
	const hasNext = !(pageNumber * pageSize >= totalDaos); // check if user's total page iterated is >= totalDaos
	const hasPrev = !(pageNumber <= 1); // check if user is on first page
	return {
		daos,
		pageInfo: {
			hasNext,
			hasPrev,
			totalDaos,
		},
	};
};

export const queryRoot = new GraphQLObjectType({
	name: "Query",
	fields: () => ({
		DaoAndPage: {
			type: DaosAndPageInfoType,
			description: "Returns Dao Records and Page Info",
			args: {
				pageNumber: {
					type: new GraphQLNonNull(GraphQLInt),
					description: "Page number as an argument",
				},
				pageSize: {
					type: new GraphQLNonNull(GraphQLInt),
					description: "Offset as an argument.",
				},
			},
			resolve: async (_: object, args: DaoArgType) => {
				const totalDaosRes = await executeQuery(QUERY_GET_DAOS_COUNT);
				const paginateRes = await executeQuery(
					getPaginatedQuery(args.pageNumber, args.pageSize)
				);
				if (validateRes(totalDaosRes, paginateRes, args)) {
					const totalDaos = totalDaosRes.rows[0].count || 0;
					paginateRes.rows.map((item: DaoItemType) => {
						if (item.app_params) {
							item.app_params = JSON.stringify(item.app_params);
						}
						return item;
					});
					return getDaoPageRes(totalDaos, paginateRes.rows, args);
				}
				return [];
			},
		},
	}),
});

module.exports = {
	queryRoot,
};
