<h1 align="center">arVest 🌾</h1>
<p align="center">A PSC Vesting Scheduler</p>

## Use it

1. 🍴 Fork this repository
2. 📝 Edit the `config.ts` file accordingly
3. 🖥️  Run `yarn` and then `yarn start`
4. 🎉  Celebrate that you didn't have to manually create 730 separate DAO proposals

### Configuration

| Variable | Type | Description |
| --- | --- | --- |
| `pst_contract_id` | string | The contract ID of the profit-sharing community you're vesting tokens in |
| `tokens_to_vest` | number | The number of tokens to vest |
| `vest_period` | number | The amount of time (in **years**) that the tokens will be vested over |
| `recipient` | string | The wallet where the locked tokens will be received |

## Contributing

Any contributions are very much welcomed. Feel free to fork and make a PR with any additions (or fixes)!