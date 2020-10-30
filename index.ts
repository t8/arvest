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
const keyfile: JWKInterface = JSON.parse(process.env.KEYFILE);

function totalVestingDays(): number {
  const now = dayjs();
  const then = now.add(config.vest_period, "year");
  return then.diff(now, "day");
}

function totalVestingBlocks(): number {
  return totalVestingDays() * 30;
}

function tokensReleased(): number {
  return Math.round(config.tokens_to_vest / totalVestingDays());
}

function generateBlockHeights(): number[] {
  let blockHeights = [];
  for (let i = 0; i < totalVestingBlocks() / 30; i++) {
    if (i = 0) {
      blockHeights[i] = 30;
    } else {
      blockHeights[i] = blockHeights[i - 1] + 30;
    }
  }
  return blockHeights;
}

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

console.log(totalVestingDays());
console.log(totalVestingBlocks());
console.log(tokensReleased());