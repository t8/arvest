<h1 align="center">arVest 🌾</h1>
<p align="center">A PSC Vesting Scheduler</p>

## Use It

> **Important note**: This project is largely a WIP - Use at your own risk!

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

## Tag Specification

In order to pull data and analytics from this script, special tags are added to the different transactions.

A DAO vote proposal contains the additional tags:
```
Application: "arVest"
Action: "Propose"
```
while a vote contains:
```
Application: "arVest"
Action: "Vote"
```

### Querying

You can use the following GraphQL query examples to pull arVest transactions:

To get any arVest transactions from a given wallet: 
```
query {
  transactions(
    owners: ["wallet_address_here"]
    tags: [
      { name: "Application", values: "arVest" }
    ]
  ) {
    edges {
      node {
        id
      }
    }
  }
}
```

To get any arVest transactions from a given contract:
```
query {
  transactions(
    tags: [
      { name: "Application", values: "arVest" }
      { name: "Contract", values: "psc_contract_id_here" }
    ]
  ) {
    edges {
      node {
        id
      }
    }
  }
}
```

To get arVest transactions of a specific action, just add the `Action` tag to a query:
```
query {
  transactions(
    tags: [
      { name: "Application", values: "arVest" }
      { name: "Action", values: "Propose" }
      { name: "Contract", values: "psc_contract_id_here" }
    ]
  ) {
    edges {
      node {
        id
      }
    }
  }
}
```

## Contributing

Any contributions are very much welcomed. Feel free to fork and make a PR with any additions (or fixes)!