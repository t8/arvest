import config from './config';
import dayjs from 'dayjs';
dayjs().format();

export interface config {
  pst_contract_id: string;
  tokens_to_vest: number;
  vest_period: number;
}

const keyfile = JSON.parse(process.env.KEYFILE);

function totalVestingDays() {
  const now = dayjs();
  const then = now.add(2, "year");
  return then.diff(then, "day");
}