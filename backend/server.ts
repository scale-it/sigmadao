import { BACKEND_PORT } from "./config";
import { schema } from "./graphql/schema";
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

app.use(
	"/api",
	graphqlHTTP({
		schema: schema,
		graphiql: true,
	})
);

app.listen(BACKEND_PORT, () => {
	console.log(`Backend is listening at ${BACKEND_PORT}`);
});
