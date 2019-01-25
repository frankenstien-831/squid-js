#!/bin/bash

set -e

# this has to go first
npm run run src/examples/RegisterServiceAgreementTemplates.ts

npm run run src/examples/BuyAsset.ts
npm run run src/examples/ExecuteAgreement.ts
npm run run src/examples/GetAccounts.ts
npm run run src/examples/GetBalance.ts
# npm run run src/examples/GrantAccess.ts
npm run run src/examples/RegisterAsset.ts
npm run run src/examples/Search.ts
