import { types, WebMode } from "@algo-builder/web";

export const fundAmount = async (
	from: string,
	to: string,
	amount: number,
	webMode: WebMode
) => {
	const txParamss: types.ExecParams[] = [
		{
			type: types.TransactionType.TransferAlgo,
			sign: types.SignType.SecretKey,
			fromAccount: {
				addr: from,
				sk: new Uint8Array(0),
			},
			toAccountAddr: to,
			amountMicroAlgos: amount,
			payFlags: { totalFee: 1000 },
		},
	];
	const response = await webMode.executeTx(txParamss);
	console.log("Funded: ", response);
};
