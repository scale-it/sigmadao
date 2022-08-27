import { ProposalType, PROPOSAL_LOCAL_STATE_MAP_KEY } from "@/constants";
import { getDaoFundLSig } from "@/contract/dao";
import { getAccountAppLocalState, isAssetOpted } from "@/indexer";
import { DAOActions, ProposalTableData } from "@/types";
import { types } from "@algo-builder/web";
import { LogicSigAccount } from "algosdk";

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
		// optIn to ASA(GOV_TOKEN) by proposalLsig
		// we will receive the deposit back into proposalLsig
		const optInTx: types.ExecParams = {
			type: types.TransactionType.OptInASA,
			sign: types.SignType.LogicSignature,
			fromAccountAddr: proposalLsig.address(),
			lsig: proposalLsig,
			assetID: tokenID,
			payFlags: {},
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
			payFlags: {},
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

		const transferResponse = await webMode.executeTx([transferAlgoTx]);
		console.log(transferResponse);
		const isGovTokenOpted = await isAssetOpted(proposalLsig.address(), tokenID);
		if (!isGovTokenOpted) {
			const optInResponse = await webMode.executeTx([optInTx]);
			console.log(optInResponse);
		}

		const closeProposalResponse = await webMode.executeTx([closeProposalTx]);

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
		const clearVoteResponse = await webMode.executeTx([clearVoteRecordTx]);
		console.log(clearVoteResponse);
	} catch (error) {
		console.error("Clear Vote Record transaction failed", error);
		throw error;
	}
};

/**
 * Execute proposal
 * @param proposerAddr : account addr of the proposer
 * @param proposalLsig : LsigAccount of the proposal
 * @param daoAppID : DAO app ID
 * @param proposalData : proposal data
 * @param webMode : webmode to execute transaction
 */
export const executeProposal = async (
	proposerAddr: string,
	proposalLsig: LogicSigAccount,
	daoAppID: number,
	proposalData: ProposalTableData,
	webMode: any // eslint-disable-line
) => {
	try {
		const daoFundLsig: LogicSigAccount = await getDaoFundLSig(daoAppID);
		const localState = await getAccountAppLocalState(
			proposalLsig.address(),
			daoAppID
		);
		const executeParams: types.ExecParams[] = [
			{
				type: types.TransactionType.CallApp,
				sign: types.SignType.SecretKey,
				fromAccount: {
					addr: proposerAddr,
					sk: new Uint8Array(0),
				},
				appID: daoAppID,
				payFlags: { totalFee: 2000 },
				appArgs: [DAOActions.EXECUTE],
				accounts: [proposalLsig.address()],
			},
		];

		switch (proposalData.type) {
			case ProposalType.ALGO_TRANSFER:
				{
					executeParams.push({
						type: types.TransactionType.TransferAlgo,
						sign: types.SignType.LogicSignature,
						fromAccountAddr: daoFundLsig.address(),
						toAccountAddr: localState?.get(
							PROPOSAL_LOCAL_STATE_MAP_KEY.Recipient
						) as string,
						amountMicroAlgos: localState?.get(
							PROPOSAL_LOCAL_STATE_MAP_KEY.Amount
						) as number,
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
						amount: localState?.get(
							PROPOSAL_LOCAL_STATE_MAP_KEY.Amount
						) as number,
						assetID: localState?.get(
							PROPOSAL_LOCAL_STATE_MAP_KEY.ASA_ID
						) as number,
						toAccountAddr: localState?.get(
							PROPOSAL_LOCAL_STATE_MAP_KEY.Recipient
						) as string,
						lsig: daoFundLsig,
						payFlags: { totalFee: 0 },
					});
				}
				break;
			case ProposalType.MESSAGE:
				// no transaction
				break;
		}

		const executeResponse = await webMode.executeTx(executeParams);
		console.log(executeResponse);
	} catch (error) {
		console.error("Execute Proposal transaction failed", error);
		throw error;
	}
};
