#!/bin/bash

set -e

# First of all to log the accounts
npm run run src/examples/GetAccounts.ts

# Before rest of examples
npm run run src/examples/RegisterServiceAgreementTemplates.ts

# Examples
npm run run src/examples/BuyAsset.ts
npm run run src/examples/ExecuteAgreement.ts
npm run run src/examples/GetBalance.ts
# npm run run src/examples/GrantAccess.ts
npm run run src/examples/RegisterAsset.ts
npm run run src/examples/Search.ts
