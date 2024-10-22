import config from './config';
import dayjs from 'dayjs';
import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import { JWKInterface } from 'arweave/node/lib/wallet';
const cliProgress = require('cli-progress');
require('dotenv').config();
dayjs().format();

export interface config {
  pst_contract_id: string;
  tokens_to_vest: number;
  vest_period: number;
  vest_time_minimum: number;
  recipient: string;
}

const keyfile: JWKInterface = JSON.parse(process.env.KEYFILE);
// const keyfile: JWKInterface = {kty: "", e: "", n: ""};

/**
 * The total number of days for tokens to be locked
 * 
 * @returns Total number of days in vesting period
 */
function totalVestingDays(): number {
  const now = dayjs();
  const start = now.add(config.vest_time_minimum, "month");
  const finish = now.add(config.vest_period, "month");
  return finish.diff(start, "day");
}

/**
 * The total number of blocks for tokens to be locked
 * 
 * @returns Total number of blocks in vesting period
 */
function totalVestingBlocks(): number {
  return totalVestingDays() * 60 / 2;
}

/**
 * The total number of blocks that pass before tokens can be unlocked
 * 
 * @returns Total number of blocks in minimum time
 */
function initialVestingBlocks(): number {
  const now = dayjs();
  const start = now.add(config.vest_time_minimum, "month");
  const days = start.diff(now, "day");
  return days * 24 * 60 / 2;
}

/**
 * The number of tokens to be unlocked at any given release time
 * 
 * @returns Number of tokens to be released at each interval
 */
function tokensReleased(): number {
  return Math.round(config.tokens_to_vest / totalVestingDays());
}

/**
 * Generates a list of block heights where tokens are to be released
 * 
 * @returns An array of numbers pertaining to each block height
 */
function generateBlockHeights(): number[] {
  let blockHeights = new Array(totalVestingBlocks() / 30);
  for (let i = 0; i < blockHeights.length; i++) {
    if (i === 0) {
      blockHeights[i] = initialVestingBlocks();
    } else {
      blockHeights[i] = blockHeights[i - 1] + 30;
    }
  }
  return blockHeights;
}

/**
 * Generates Arweave transactions for proposing each scheduled release
 * @param blockHeights block heights release schedule
 * 
 * @returns An array of Arweave transactions
 */
async function generateVoteProposals(blockHeights: number[]): Promise<Transaction[]> {
  const client: Arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false,
  });

  let transactions: Transaction[] = [];
  const prog = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  prog.start(blockHeights.length - 1, 0);

  for (let i = 0; i < blockHeights.length; i++) {
    let tags = {
      "Application": "arVest",
      "Action": "Propose",
      "App-Name": "SmartWeaveAction",
      "App-Version": "0.3.0",
      "Contract": config.pst_contract_id,
      "Input": JSON.stringify({
        "type": "mintLocked",
        "recipient": config.recipient,
        "qty": tokensReleased(),
        "lockLength": blockHeights[i],
        "note": "arVest: Scheduled Vest",
        "function": "propose"
      }),
    };

    // Generate the transaction
    transactions[i] = await client.createTransaction({
      data: Math.random().toString().slice(-4)
    }, keyfile);

    // Add the tags
    for (const [key, value] of Object.entries(tags)) {
      transactions[i].addTag(key, value.toString());
    }

    await client.transactions.sign(transactions[i], keyfile);
    prog.update(i);
  }

  prog.stop();
  return transactions;
}

/**
 * Generates Arweave transactions for voting on each proposal
 * @param startingVoteIndex The starting vote ID
 * 
 * @returns An array of Arweave transactions
 */
async function generateVotes(startingVoteIndex: number): Promise<Transaction[]> {
  const client: Arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false,
  });

  let transactions: Transaction[] = [];
  const endingVoteIndex: number = startingVoteIndex + (totalVestingBlocks() / 30);
  
  for (let i = startingVoteIndex; i < endingVoteIndex; i++) {
    let tags = {
      "Application": "arVest",
      "Action": "Vote",
      "App-Name": "SmartWeaveAction",
      "App-Version": "0.3.0",
      "Contract": config.pst_contract_id,
      "Input": JSON.stringify({
        "function": "vote",
        "id": i,
        "cast": "yay"
      }),
    };

    // Generate the transaction
    transactions[i] = await client.createTransaction({
      data: Math.random().toString().slice(-4)
    }, keyfile);

    // Add the tags
    for (const [key, value] of Object.entries(tags)) {
      transactions[i].addTag(key, value.toString());
    }

    await client.transactions.sign(transactions[i], keyfile);
  }
  return transactions;
}

/**
 * Posts Arweave transactions
 * @param transactions Array of transactions to post
 * 
 * @returns Array of transaction IDs
 */
async function postTransactions(transactions: Transaction[]): Promise<string[]> {
  const client: Arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false,
  });
  let ids: string[] = [];
  const prog = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  prog.start(transactions.length - 1, 0);

  for (let i = 0; i < transactions.length; i++) {
    try {
      await client.transactions.post(transactions[i]);
      ids.push(transactions[i].id);
      prog.update(i);
    } catch (err) {
      console.error(err);
      prog.stop();
    }
  }
  prog.stop();
  return ids;
}

// Initialize & run the scheduler
(async () => {
  console.log("Generating block heights...");
  const blockHeights = generateBlockHeights();
  console.log(`Generating ${blockHeights.length} proposal transactions...`);
  const transactions = await generateVoteProposals(blockHeights);
  console.log("Posting proposal transactions...");
  let postedTransactions = await postTransactions(transactions);
  console.log(`Successfully posted ${postedTransactions.length} transactions`);
})();