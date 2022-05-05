import algosdk from "algosdk";

const indexer_token = process.env.INDEXER_TOKEN || "";
const indexer_server = process.env.INDEXER_URL || "http://localhost";
const indexer_port = process.env.INDEXER_PORT || 8980;

/* indexer config for TestNet */
// export const indexer_testnet_server = "https://testnet.algoexplorerapi.io/idx2";

const indexerClient: algosdk.Indexer = new algosdk.Indexer(
	indexer_token,
	indexer_server,
	indexer_port
);

export default indexerClient;
