import { executeQuery } from "./psql/queryExecute";
import { QUERY_GET_ALL_DAOS } from "./psql/query";
import { DaoItemType } from "./types";
const express = require("express");
const cors = require("cors");
const app = express();
const { graphqlHTTP } = require("express-graphql");
const {
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
	GraphQLInt,
	GraphQLList,
} = require("graphql");
app.use(cors());

const DaoType = new GraphQLObjectType({
	name: "Dao",
	description: "Dao Single Record",
	fields: () => ({
		app_id: { type: GraphQLInt, description: "app id" },
		app_params: {
			type: GraphQLString,
			description: "app params like global state etc.",
		},
		asset_id: { type: GraphQLInt, description: "asset id" },
	}),
});

const QueryRoot = new GraphQLObjectType({
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

const schema = new GraphQLSchema({ query: QueryRoot });

app.use(
	"/api",
	graphqlHTTP({
		schema: schema,
		graphiql: true,
	})
);

app.listen(4000);
