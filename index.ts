import config from './config';
import dayjs from 'dayjs';
import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import { JWKInterface } from 'arweave/node/lib/wallet';
dayjs().format();

export interface config {
  pst_contract_id: string;
  tokens_to_vest: number;
  vest_period: number;
}

// const keyfile = JSON.parse(process.env.KEYFILE);
const keyfile: JWKInterface = {kty: "", e: "", n: ""};

/**
 * The total number of days for tokens to be locked
 */
function totalVestingDays(): number {
  const now = dayjs();
  const then = now.add(config.vest_period, "year");
  return then.diff(now, "day");
}

/**
 * The total number of blocks for tokens to be locked
 */
function totalVestingBlocks(): number {
  return totalVestingDays() * 30;
}

/**
 * The number of tokens to be unlocked at any given release time
 */
function tokensReleased(): number {
  return Math.round(config.tokens_to_vest / totalVestingDays());
}

/**
 * Generates a list of block heights where tokens are to be released
 */
function generateBlockHeights(): number[] {
  let blockHeights = new Array(totalVestingBlocks() / 30);
  for (let i = 0; i < blockHeights.length; i++) {
    if (i === 0) {
      blockHeights[i] = 0;
    } else {
      blockHeights[i] = blockHeights[i - 1] + 30;
    }
  }
  return blockHeights;
}

/**
 * Generates Arweave transactions for each scheduled release
 * @param blockHeights block heights release schedule
 * @returns array of Arweave transactions
 */
async function generateTransactions(blockHeights: number[]): Promise<Transaction[]> {
  const client = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false,
  });
  let transactions = [];

  for (let i = 0; i < blockHeights.length; i++) {
    transactions[i] = await client.createTransaction({
      data: Math.random().toString().slice(1, 4)
    }, keyfile);
    transactions[i].addTag("Application", "ArVest");
  }

  return transactions;
}

generateBlockHeights();