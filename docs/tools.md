# Tools

50 tools. Seven (marked †) are only registered when `STARLING_ENABLE_SENSITIVE_TOOLS=true`; with the default settings you get 43. See [security.md](security.md) for why.

Every tool carries MCP annotations: list/get/insight tools are read-only; update, delete, cancel, withdraw and card-control tools are destructive; payments and standing orders are open-world (they send money to someone else).

Amounts use Starling's `{ currency, minorUnits }` form (pence for GBP). Every `*_uid` argument must be a UUID. Starling's feed endpoints return everything in the requested window with no paging, so narrow the window with `changes_since` or `list_feed_items_between` for busy accounts.

## Accounts (5 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_accounts` | List all accounts | `GET /api/v2/accounts` |
| `starling_get_account_identifiers` | Get sort code, account number, IBAN | `GET /api/v2/accounts/{accountUid}/identifiers` |
| `starling_get_balance` | Get account balance | `GET /api/v2/accounts/{accountUid}/balance` |
| `starling_confirmation_of_funds` | Check if funds available | `GET /api/v2/accounts/{accountUid}/confirmation-of-funds` |
| `starling_get_statement_periods` | List available statement periods | `GET /api/v2/accounts/{accountUid}/statement/available-periods` |

## Account Holder (6 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_get_account_holder` | Get account holder type | `GET /api/v2/account-holder` |
| `starling_get_account_holder_name` | Get account holder name | `GET /api/v2/account-holder/name` |
| `starling_get_individual` | Get individual details | `GET /api/v2/account-holder/individual` |
| `starling_get_joint_account` | Get joint account details | `GET /api/v2/account-holder/joint` |
| `starling_get_business` | Get business details | `GET /api/v2/account-holder/business` |
| `starling_get_addresses` | Get addresses | `GET /api/v2/addresses` |

## Transaction Feed (6 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_feed_items` | List transactions (optional `changesSince` filter) | `GET /api/v2/feed/account/{accountUid}/category/{categoryUid}` |
| `starling_get_feed_item` | Get single transaction | `GET /api/v2/feed/account/{accountUid}/category/{categoryUid}/{feedItemUid}` |
| `starling_list_feed_items_between` | Transactions between two dates | `GET .../transactions-between` |
| `starling_update_feed_item_note` | Update transaction note | `PUT .../user-note` |
| `starling_update_spending_category` | Change spending category | `PUT .../spending-category` |
| `starling_list_feed_item_attachments` | List attachments | `GET .../attachments` |

## Savings Goals (7 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_savings_goals` | List all savings goals | `GET /api/v2/account/{accountUid}/savings-goals` |
| `starling_get_savings_goal` | Get savings goal details | `GET .../savings-goals/{savingsGoalUid}` |
| `starling_create_savings_goal` | Create a new savings goal | `PUT /api/v2/account/{accountUid}/savings-goals` |
| `starling_add_money_to_savings_goal` † | Add money to goal | `PUT .../add-money/{transferUid}` |
| `starling_withdraw_from_savings_goal` † | Withdraw from goal | `PUT .../withdraw-money/{transferUid}` |
| `starling_delete_savings_goal` † | Delete a savings goal | `DELETE .../savings-goals/{savingsGoalUid}` |
| `starling_get_savings_goal_recurring_transfer` | Get recurring transfer | `GET .../recurring-transfer` |

## Payees (4 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_payees` | List all payees | `GET /api/v2/payees` |
| `starling_create_payee` † | Create a new payee | `PUT /api/v2/payees` |
| `starling_delete_payee` | Delete a payee | `DELETE /api/v2/payees/{payeeUid}` |
| `starling_delete_payee_account` | Delete a payee's account | `DELETE .../account/{accountUid}` |

## Payments (3 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_make_local_payment` † | Make a UK payment | `PUT /api/v2/payments/local/account/{accountUid}/category/{categoryUid}` |
| `starling_get_payment_order` | Get payment order details | `GET /api/v2/payments/local/payment-order/{paymentOrderUid}` |
| `starling_get_payment_order_payments` | Get payments in an order | `GET .../payments` |

## Standing Orders (5 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_standing_orders` | List standing orders | `GET .../standing-orders` |
| `starling_get_standing_order` | Get standing order details | `GET .../standing-orders/{paymentOrderUid}` |
| `starling_create_standing_order` † | Create a standing order | `PUT .../standing-orders` |
| `starling_cancel_standing_order` | Cancel a standing order | `DELETE .../standing-orders/{paymentOrderUid}` |
| `starling_get_upcoming_standing_order_payments` | Get upcoming payments | `GET .../upcoming-payments` |

## Direct Debits (3 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_list_direct_debit_mandates` | List all mandates | `GET /api/v2/direct-debit/mandates` |
| `starling_get_direct_debit_mandate` | Get mandate details | `GET .../mandates/{mandateUid}` |
| `starling_cancel_direct_debit_mandate` † | Cancel a mandate | `DELETE .../mandates/{mandateUid}` |

## Card Controls (8 tools)

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

## Spending Insights (3 tools)

| Tool | Description | API Endpoint |
|------|-------------|-------------|
| `starling_spending_by_counterparty` | Spending by merchant | `GET .../spending-insights/counter-party` |
| `starling_spending_by_category` | Spending by category | `GET .../spending-insights/spending-category` |
| `starling_spending_by_country` | Spending by country | `GET .../spending-insights/country` |

## Example prompts

- "What's my balance?"
- "Show my transactions from last week"
- "How much did I spend on groceries in March 2025?"
- "Lock my debit card"
- "List my savings goals and how close each is to its target"
