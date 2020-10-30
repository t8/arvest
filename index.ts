import config from './config';
import dayjs from 'dayjs';
dayjs().format();

export interface config {
  pst_contract_id: string;
  tokens_to_vest: number;
  vest_period: number;
}

// const keyfile = JSON.parse(process.env.KEYFILE);

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

console.log(totalVestingDays());
console.log(totalVestingBlocks());
console.log(tokensReleased());