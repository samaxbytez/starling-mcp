# starling-mcp

[![npm version](https://img.shields.io/npm/v/starling-mcp.svg)](https://www.npmjs.com/package/starling-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP (Model Context Protocol) server for the [Starling Bank API](https://developer.starlingbank.com/docs). Connect Claude and other AI assistants to your Starling Bank account to check balances, view transactions, manage savings goals, control cards, and more.

Built on Starling's v2 API, this server provides 50 tools covering accounts, transactions, savings goals, payees, payments, standing orders, direct debits, card controls, and spending insights.

## Features

- **Accounts** - List accounts, get balance, account identifiers, confirmation of funds, statement periods
- **Account Holder** - View account holder details (individual, joint, business), addresses
- **Transaction Feed** - List transactions, filter by date range, update notes and spending categories
- **Savings Goals** - Create, manage, add/withdraw money, view recurring transfers
- **Payees** - List, create, and delete payees and their accounts
- **Payments** - Make domestic UK payments, view payment orders
- **Standing Orders** - List, create, cancel standing orders, view upcoming payments
- **Direct Debits** - List and cancel direct debit mandates
- **Card Controls** - Lock/unlock cards, toggle ATM, online, mobile wallet, gambling, POS, mag stripe
- **Spending Insights** - Monthly spending breakdowns by counter-party, category, and country

## Prerequisites

You need a **Starling Bank Personal Access Token**. To get one:

1. Go to [Starling Developer Portal](https://developer.starlingbank.com/)
2. Sign in with your Starling Bank account
3. Create a new application or use the Personal Access Token option
4. Select the scopes you need (e.g., `account:read`, `balance:read`, `transaction:read`, `savings-goal:read`)
5. Copy the generated token

**Note:** Personal access tokens are rate-limited to 5 requests/second and 1,000 requests/day.

## Installation

### Using npx (recommended)

```bash
npx starling-mcp
```

### Global install

```bash
npm install -g starling-mcp
starling-mcp
```

### Build from source

```bash
git clone https://github.com/samaxbytez/starling-mcp.git
cd starling-mcp
npm install
npm run build
node build/index.js
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STARLING_ACCESS_TOKEN` | Yes | Your Starling Bank personal access token |

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "starling": {
      "command": "npx",
      "args": ["-y", "starling-mcp"],
      "env": {
        "STARLING_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "starling": {
      "command": "npx",
      "args": ["-y", "starling-mcp"],
      "env": {
        "STARLING_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Other MCP Clients

Set the `STARLING_ACCESS_TOKEN` environment variable and run:

```bash
STARLING_ACCESS_TOKEN=your_token npx starling-mcp
```

## Architecture

```
starling-mcp/
├── src/
│   ├── index.ts              # Entry point, server setup
│   ├── client.ts             # Starling API HTTP client
│   ├── utils.ts              # Shared utilities (jsonResponse, errorResponse, etc.)
│   ├── client.test.ts        # Client tests
│   ├── utils.test.ts         # Utils tests
│   └── tools/
│       ├── accounts.ts       # Account, balance, identifiers tools
│       ├── account-holder.ts # Account holder info tools
│       ├── feed.ts           # Transaction feed tools
│       ├── savings-goals.ts  # Savings goal management tools
│       ├── payees.ts         # Payee management tools
│       ├── payments.ts       # Payment tools
│       ├── standing-orders.ts # Standing order tools
│       ├── direct-debits.ts  # Direct debit mandate tools
│       ├── cards.ts          # Card control tools
│       ├── spending-insights.ts # Spending insights tools
│       └── tools.test.ts     # Tool handler tests
├── package.json
├── tsconfig.json
└── README.md
```

**Design decisions:**
- Uses Pattern A (Simple Bearer Token) since Starling uses personal access tokens
- One file per tool category for clean separation of concerns
- All tool handlers use consistent `logToolCall()` + `try/catch` + `jsonResponse()`/`errorResponse()` pattern
- Amounts use Starling's `CurrencyAndAmount` format (`{ currency: "GBP", minorUnits: 1234 }`)

## Tools Reference

### Accounts (5 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_accounts` | List all accounts | `GET /api/v2/accounts` |
| `starling_get_account_identifiers` | Get sort code, account number, IBAN | `GET /api/v2/accounts/{accountUid}/identifiers` |
| `starling_get_balance` | Get account balance | `GET /api/v2/accounts/{accountUid}/balance` |
| `starling_confirmation_of_funds` | Check if funds available | `GET /api/v2/accounts/{accountUid}/confirmation-of-funds` |
| `starling_get_statement_periods` | List available statement periods | `GET /api/v2/accounts/{accountUid}/statement/available-periods` |

### Account Holder (6 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_get_account_holder` | Get account holder type | `GET /api/v2/account-holder` |
| `starling_get_account_holder_name` | Get account holder name | `GET /api/v2/account-holder/name` |
| `starling_get_individual` | Get individual details | `GET /api/v2/account-holder/individual` |
| `starling_get_joint_account` | Get joint account details | `GET /api/v2/account-holder/joint` |
| `starling_get_business` | Get business details | `GET /api/v2/account-holder/business` |
| `starling_get_addresses` | Get addresses | `GET /api/v2/addresses` |

### Transaction Feed (6 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_feed_items` | List transactions (optional `changesSince` filter) | `GET /api/v2/feed/account/{accountUid}/category/{categoryUid}` |
| `starling_get_feed_item` | Get single transaction | `GET /api/v2/feed/account/{accountUid}/category/{categoryUid}/{feedItemUid}` |
| `starling_list_feed_items_between` | Transactions between two dates | `GET .../transactions-between` |
| `starling_update_feed_item_note` | Update transaction note | `PUT .../user-note` |
| `starling_update_spending_category` | Change spending category | `PUT .../spending-category` |
| `starling_list_feed_item_attachments` | List attachments | `GET .../attachments` |

### Savings Goals (7 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_savings_goals` | List all savings goals | `GET /api/v2/account/{accountUid}/savings-goals` |
| `starling_get_savings_goal` | Get savings goal details | `GET .../savings-goals/{savingsGoalUid}` |
| `starling_create_savings_goal` | Create a new savings goal | `PUT /api/v2/account/{accountUid}/savings-goals` |
| `starling_add_money_to_savings_goal` | Add money to goal | `PUT .../add-money/{transferUid}` |
| `starling_withdraw_from_savings_goal` | Withdraw from goal | `PUT .../withdraw-money/{transferUid}` |
| `starling_delete_savings_goal` | Delete a savings goal | `DELETE .../savings-goals/{savingsGoalUid}` |
| `starling_get_savings_goal_recurring_transfer` | Get recurring transfer | `GET .../recurring-transfer` |

### Payees (4 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_payees` | List all payees | `GET /api/v2/payees` |
| `starling_create_payee` | Create a new payee | `PUT /api/v2/payees` |
| `starling_delete_payee` | Delete a payee | `DELETE /api/v2/payees/{payeeUid}` |
| `starling_delete_payee_account` | Delete a payee's account | `DELETE .../account/{accountUid}` |

### Payments (3 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_make_local_payment` | Make a UK payment | `PUT /api/v2/payments/local/account/{accountUid}/category/{categoryUid}` |
| `starling_get_payment_order` | Get payment order details | `GET /api/v2/payments/local/payment-order/{paymentOrderUid}` |
| `starling_get_payment_order_payments` | Get payments in an order | `GET .../payments` |

### Standing Orders (5 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_standing_orders` | List standing orders | `GET .../standing-orders` |
| `starling_get_standing_order` | Get standing order details | `GET .../standing-orders/{paymentOrderUid}` |
| `starling_create_standing_order` | Create a standing order | `PUT .../standing-orders` |
| `starling_cancel_standing_order` | Cancel a standing order | `DELETE .../standing-orders/{paymentOrderUid}` |
| `starling_get_upcoming_standing_order_payments` | Get upcoming payments | `GET .../upcoming-payments` |

### Direct Debits (3 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_direct_debit_mandates` | List all mandates | `GET /api/v2/direct-debit/mandates` |
| `starling_get_direct_debit_mandate` | Get mandate details | `GET .../mandates/{mandateUid}` |
| `starling_cancel_direct_debit_mandate` | Cancel a mandate | `DELETE .../mandates/{mandateUid}` |

### Card Controls (8 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_cards` | List all cards | `GET /api/v2/cards` |
| `starling_enable_card` | Lock/unlock card | `PUT .../controls/enabled` |
| `starling_enable_atm` | Toggle ATM withdrawals | `PUT .../controls/atm-enabled` |
| `starling_enable_online_payments` | Toggle online payments | `PUT .../controls/online-enabled` |
| `starling_enable_mobile_wallet` | Toggle mobile wallet | `PUT .../controls/mobile-wallet-enabled` |
| `starling_enable_gambling` | Toggle gambling | `PUT .../controls/gambling-enabled` |
| `starling_enable_pos` | Toggle POS payments | `PUT .../controls/pos-enabled` |
| `starling_enable_mag_stripe` | Toggle mag stripe | `PUT .../controls/mag-stripe-enabled` |

### Spending Insights (3 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_spending_by_counterparty` | Spending by merchant | `GET .../spending-insights/counter-party` |
| `starling_spending_by_category` | Spending by category | `GET .../spending-insights/spending-category` |
| `starling_spending_by_country` | Spending by country | `GET .../spending-insights/country` |

## Example Prompts

- "What's my current account balance?"
- "Show me all my transactions from last month"
- "How much have I spent on groceries this month?"
- "List all my savings goals and how much is saved in each"
- "Create a new savings goal called 'Holiday Fund' with a target of 500 pounds"
- "Add 50 pounds to my Holiday Fund savings goal"
- "Show me my standing orders"
- "Who are my saved payees?"
- "Lock my debit card"
- "What are my direct debit mandates?"

## Development

### Build

```bash
npm run build
```

### Run tests

```bash
npm test
```

### Watch mode

```bash
npm run test:watch
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Adding new tools

1. Create a new file in `src/tools/` or add to an existing category
2. Follow the pattern: `registerXxxTools(server, client)` function
3. Import and call the register function in `src/index.ts`
4. Add tests in `src/tools/tools.test.ts`
5. Update this README

## Troubleshooting

### "Missing required environment variable: STARLING_ACCESS_TOKEN"

Set the `STARLING_ACCESS_TOKEN` environment variable before running the server. Check your Claude Desktop or Claude Code config.

### "Starling API error (401): invalid_token"

Your personal access token may have expired or been revoked. Generate a new one from the [Starling Developer Portal](https://developer.starlingbank.com/).

### "Starling API error (429): Too many requests"

You've hit the rate limit (5 req/s, 1,000 req/day for personal tokens). Wait and retry.

### "Starling API error (403): ..."

Your token may not have the required scopes. Regenerate the token with the needed permissions (e.g., `balance:read`, `transaction:read`).

### Tools requiring account_uid and category_uid

Most tools require an `account_uid` and/or `category_uid`. First call `starling_list_accounts` to get these values. The response includes `accountUid` and `defaultCategory` for each account.

### Card control operations fail

Card control operations (lock/unlock, ATM toggle, etc.) may require additional token scopes (`card:control`). Ensure your token includes this scope.

## License

MIT
