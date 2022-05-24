const { GraphQLObjectType, GraphQLString, GraphQLInt } = require("graphql");

export const DaoType = new GraphQLObjectType({
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
