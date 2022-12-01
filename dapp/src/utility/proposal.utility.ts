import {
	GLOBAL_STATE_MAP_KEY,
	ProposalType,
	PROPOSAL_LOCAL_STATE_MAP_KEY,
} from "@/constants";
import { getDaoFundLSig } from "@/contract/dao";
import { getAccountAppLocalState, isAssetOpted } from "@/indexer";
import DaoID from "@/store/DaoID";
import { DAOActions, ProposalTableData } from "@/types";
import { types } from "@algo-builder/web";
import { LogicSigAccount, microalgosToAlgos } from "algosdk";
import moment from "moment";
import { toRaw } from "vue";
import { isCurrentTimeValid } from "./dateFormatter.utility";

/**
 * closes proposal by creator
 * @param proposerAddr : account addr of the proposer
 * @param proposalLsig : LsigAccount of the proposal
 * @param tokenID : Gov Token ID/index
 * @param daoAppID : DAO app ID
 * @param webMode : webmode to execute transaction
 */
export const closeProposal = async (
	proposerAddr: string,
	proposalLsig: LogicSigAccount,
	tokenID: number,
	daoAppID: number,
	webMode: any // eslint-disable-line
) => {
	try {
		const webmode = toRaw(webMode);
		// optIn to ASA(GOV_TOKEN) by proposalLsig
		// we will receive the deposit back into proposalLsig
		const optInTx: types.ExecParams = {
			type: types.TransactionType.TransferAsset,
			sign: types.SignType.LogicSignature,
			fromAccountAddr: proposalLsig.address(),
			toAccountAddr: proposalLsig.address(),
			amount: 0,
			lsig: proposalLsig,
			assetID: tokenID,
			payFlags: { totalFee: 1000 },
		};

		const transferAlgoTx: types.ExecParams = {
			type: types.TransactionType.TransferAlgo,
			sign: types.SignType.SecretKey,
			fromAccount: {
				addr: proposerAddr,
				sk: new Uint8Array(0),
			},
			toAccountAddr: proposalLsig.address(),
			amountMicroAlgos: 0,
			payFlags: { totalFee: 1000 },
		};

		const closeProposalTx: types.ExecParams = {
			type: types.TransactionType.CallApp,
			sign: types.SignType.LogicSignature,
			fromAccountAddr: proposalLsig.address(),
			appID: daoAppID,
			lsig: proposalLsig,
			payFlags: { totalFee: 2000 },
			appArgs: [DAOActions.CLOSE_PROPOSAL],
			foreignAssets: [tokenID],
		};

		const isGovTokenOpted = await isAssetOpted(proposalLsig.address(), tokenID);
		if (!isGovTokenOpted) {
			const optInResponse = await webmode.executeTx([transferAlgoTx, optInTx]);
			console.log("optin", optInResponse);
		}

		const closeProposalResponse = await webmode.executeTx([closeProposalTx]);
		console.log(closeProposalResponse);
	} catch (error) {
		console.error("Close Proposal transaction failed", error);
		throw error;
	}
};

/**
 * Clearing vote record of ${voterAddr} from proposal
 * @param proposalLsigAddr : LsigAccount of the proposal address
 * @param voterAddr : voter address
 * @param daoAppID : DAO app ID
 * @param webMode : webmode to execute transaction
 */
export const clearVoteRecord = async (
	proposalLsigAddr: string,
	voterAddr: string,
	daoAppID: number,
	webMode: any // eslint-disable-line
) => {
	try {
		const clearVoteRecordTx: types.ExecParams = {
			type: types.TransactionType.CallApp,
			sign: types.SignType.SecretKey,
			fromAccount: {
				addr: voterAddr,
				sk: new Uint8Array(0),
			},
			appID: daoAppID,
			payFlags: { totalFee: 1000 },
			appArgs: [DAOActions.CLEAR_VOTE_RECORD],
			accounts: [proposalLsigAddr],
		};
		const clearVoteResponse = await toRaw(webMode).executeTx([
			clearVoteRecordTx,
		]);
		console.log(clearVoteResponse);
	} catch (error) {
		console.error("Clear Vote Record transaction failed", error);
		throw error;
	}
};

/**
 * Execute proposal
 * @param senderAddr : account addr of user initiating the action
 * @param proposalLsigAddr : LsigAccount address of the proposal
 * @param daoAppID : DAO app ID
 * @param proposalData : proposal data
 * @param webMode : webmode to execute transaction
 */
export const executeProposal = async (
	senderAddr: string,
	proposalLsigAddr: string,
	daoAppID: number,
	proposalData: ProposalTableData,
	webMode: any // eslint-disable-line
) => {
	try {
		const daoFundLsig: LogicSigAccount = await getDaoFundLSig(daoAppID);
		const localState = await getAccountAppLocalState(
			proposalLsigAddr,
			daoAppID
		);
		const executeParams: types.ExecParams[] = [
			{
				type: types.TransactionType.CallApp,
				sign: types.SignType.SecretKey,
				fromAccount: {
					addr: senderAddr,
					sk: new Uint8Array(0),
				},
				appID: daoAppID,
				payFlags: { totalFee: 2000 },
				appArgs: [DAOActions.EXECUTE],
				accounts: [proposalLsigAddr],
			},
		];
		const recipientAddr = localState?.get(
			PROPOSAL_LOCAL_STATE_MAP_KEY.Recipient
		) as string;

		const amount = localState?.get(
			PROPOSAL_LOCAL_STATE_MAP_KEY.Amount
		) as number;

		const assetID = localState?.get(
			PROPOSAL_LOCAL_STATE_MAP_KEY.ASA_ID
		) as number;

		if (proposalData.type === ProposalType.ASA_TRANSFER) {
			await optInASA(
				daoFundLsig.address(),
				assetID,
				daoFundLsig,
				webMode
			);
			await transferASA(
				senderAddr,
				daoFundLsig.address(),
				amount,
				assetID,
				webMode
			);
		}

		switch (proposalData.type) {
			case ProposalType.ALGO_TRANSFER:
				{
					executeParams.push({
						type: types.TransactionType.TransferAlgo,
						sign: types.SignType.LogicSignature,
						fromAccountAddr: daoFundLsig.address(),
						toAccountAddr: recipientAddr as string,
						amountMicroAlgos: amount as number,
						lsig: daoFundLsig,
						payFlags: { totalFee: 0 },
					});
				}
				break;
			case ProposalType.ASA_TRANSFER:
				{
					executeParams.push({
						type: types.TransactionType.TransferAsset,
						sign: types.SignType.LogicSignature,
						fromAccountAddr: daoFundLsig.address(),
						toAccountAddr: recipientAddr as string,
						amount: amount,
						lsig: daoFundLsig,
						assetID: assetID,
						payFlags: { totalFee: 0 }
					});
				}
				break;
			case ProposalType.MESSAGE:
				// no transaction
				break;
		}

		const executeResponse = await toRaw(webMode).executeTx(executeParams);
		console.log(executeResponse);
	} catch (error) {
		console.error("Execute Proposal transaction failed", error);
		throw error;
	}
};

export const checkCurrentProposalState = (
	record: ProposalTableData
): { text: string; color: string } => {
	let text = "";
	let color = "";
	const currentTime = moment(new Date()).unix();
	if (isCurrentTimeValid(record.voting_start, record.voting_end)) {
		text = "Voting is active";
		color = "processing";
	} else if (
		isCurrentTimeValid(record.voting_end, record.execute_before) &&
		record.executed !== 1 &&
		checkProposalResult(record)
	) {
		text = "Waiting for Execution";
		color = "warning";
	} else if (
		record.executed !== 1 &&
		record.execute_before < currentTime &&
		checkProposalResult(record)
	) {
		text = "Overdue";
		color = "default";
	} else if (record.executed === 1) {
		text = "Executed";
		color = "success";
	} else if (record.voting_start > currentTime) {
		text = "Voting is yet to start";
		color = "default";
	} else if (record.voting_end < currentTime && !checkProposalResult(record)) {
		text = "Proposal didn't pass";
		color = "error";
	}
	return { text, color };
};

export const checkProposalResult = (record: ProposalTableData) => {
	const daoStore = DaoID();
	const minSupport = daoStore.global_app_state?.get(
		GLOBAL_STATE_MAP_KEY.MinSupport
	) as number;
	const yesVotes = record.yes ?? 0;
	const noVotes = record.no ?? 0;
	if (yesVotes >= minSupport && yesVotes > noVotes) {
		return true;
	}
	return false;
};

/**
 * Opt ASA to given account
 * @param from : Account address that wants to opt asset
 * @param assetID : Asset ID
 * @param lsig : Logic Signature
 * @param webMode : webmode instace to execute transaction
 */
export const optInASA = async (from: string, assetID: number, lsig: LogicSigAccount, webMode: any) => {
	const execParam: types.ExecParams[] = [
		{
			type: types.TransactionType.OptInASA,
			sign: types.SignType.LogicSignature,
			fromAccountAddr: from,
			lsig: lsig,
			assetID: assetID,
			payFlags: { totalFee: 1000 },
		},
	];

	await toRaw(webMode).executeTx(execParam);
}

/**
 * Transfer ASA from one account to another account
 * @param from : Account address that wants to send transfer ASA
 * @param to : Account address that wants to receive ASA
 * @param numberOfASA : Number of ASA that has to be transferred
 * @param assetID : Asset ID
 * @param webMode : webmode instace to execute transaction
 */
export const transferASA = async (from: string, to: string, numberOfASA: number, assetID: number, webMode: any) => {
	const execParams: types.ExecParams[] = [
		{
			type: types.TransactionType.TransferAsset,
			sign: types.SignType.SecretKey,
			fromAccount: {
				addr: from,
				sk: new Uint8Array(0),
			},
			toAccountAddr: to,
			amount: numberOfASA,
			assetID: assetID,
			payFlags: { totalFee: 1000 },
		}
	];

	await toRaw(webMode).executeTx(execParams);
}
