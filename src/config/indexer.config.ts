import algosdk from "algosdk";

const indexer_token = "";
const indexer_server = "http://localhost";
const indexer_port = 8980;

/* indexer config for TestNet */
// export const indexer_testnet_server = "https://testnet.algoexplorerapi.io/idx2";

const indexerClient: algosdk.Indexer = new algosdk.Indexer(
	indexer_token,
	indexer_server,
	indexer_port
);

export default indexerClient;
