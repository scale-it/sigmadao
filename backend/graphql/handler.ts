import { executeQuery } from "../psql/queryExecute";
import { QUERY_GET_ALL_DAOS } from "../psql/query";
import { DaoType } from "./types";
import { DaoItemType } from "../types";
const { GraphQLObjectType, GraphQLList } = require("graphql");

export const queryRoot = new GraphQLObjectType({
	name: "Query",
	fields: () => ({
		Daos: {
			type: new GraphQLList(DaoType),
			description: "Dao Records",
			resolve: async () => {
				const res = await executeQuery(QUERY_GET_ALL_DAOS);
				if (res && res.rows && res.rows.length) {
					res.rows.map((item: DaoItemType) => {
						if (item.app_params) {
							item.app_params = JSON.stringify(item.app_params);
						}
						return item;
					});
					return res.rows;
				}
				return [];
			},
		},
	}),
});

module.exports = {
	queryRoot,
};
