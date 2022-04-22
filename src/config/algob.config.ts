import algosdk from "algosdk";

const token =
	"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const server = "http://localhost";
const port = 4001;

const algodClient = new algosdk.Algodv2(token, server, port);

export default algodClient;
