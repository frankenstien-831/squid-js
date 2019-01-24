[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# squid-js

> 🦑 JavaScript client library for Ocean Protocol
> [oceanprotocol.com](https://oceanprotocol.com)

[![npm](https://img.shields.io/npm/v/@oceanprotocol/squid.svg)](https://www.npmjs.com/package/@oceanprotocol/squid)
[![Travis (.com)](https://img.shields.io/travis/com/oceanprotocol/squid-js.svg)](https://travis-ci.com/oceanprotocol/squid-js)
[![GitHub contributors](https://img.shields.io/github/contributors/oceanprotocol/squid-js.svg)](https://github.com/oceanprotocol/squid-js/graphs/contributors)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8508313231b44b0997ec84898cd6f9db)](https://app.codacy.com/app/ocean-protocol/squid-js?utm_source=github.com&utm_medium=referral&utm_content=oceanprotocol/squid-js&utm_campaign=Badge_Grade_Settings)
[![js oceanprotocol](https://img.shields.io/badge/js-oceanprotocol-7b1173.svg)](https://github.com/oceanprotocol/eslint-config-oceanprotocol) 
[![Greenkeeper badge](https://badges.greenkeeper.io/oceanprotocol/squid-js.svg)](https://greenkeeper.io/)

---

**🐲🦑 THERE BE DRAGONS AND SQUIDS. This is in alpha state and you can expect running into problems. If you run into them, please open up [a new issue](https://github.com/oceanprotocol/squid-js/issues). 🦑🐲**

---

## Table of Contents

  - [Get started](#get-started)
    - [Examples](#examples)
  - [Development](#development)
    - [Production build](#production-build)
    - [npm releases](#npm-releases)
  - [License](#license)

---

## Get started

Start by adding the package to your dependencies:

```bash
npm i @oceanprotocol/squid --save
```

The package exposes `Ocean` and `Logger` which you can import in your code like this:

```js
// ES6
import { Ocean, Logger } from '@oceanprotocol/squid'

// ES2015
const { Ocean, Logger } = require('@oceanprotocol/squid')
```

You can then connect to a running [Keeper](https://github.com/oceanprotocol/keeper-contracts) & [Aquarius](https://github.com/oceanprotocol/aquarius) instance, e.g.:

```js
const ocean: Ocean = await Ocean.getInstance({
    // the node of the blockchain to connect to, could also be infura
    nodeUri: "http://localhost:8545",
    // the uri of aquarius
    aquariusUri: "http://localhost:5000",
    // the uri of brizo
    brizoUri: "http://localhost:8030",
    // the uri to the parity node you want to use for encryption and decryption
    parityUri: "http://localhost:9545",
    // the uri of the secret store that holds the keys
    secretStoreUri: "http://localhost:12001",
    // the threshold of nodes from the secre store that have to agree to the decrypt
    threshold: 0,
    // the password for the account (in the local parity node) used to sign messages for secret store
    password: "you password",
    // the address of the account (in the local parity node) used to sign messages for secret store
    address: "0xed243adfb84a6626eba46178ccb567481c6e655d",
})
```

### Examples

* [Examples](/src/examples/)
* [Tuna](https://github.com/oceanprotocol/tuna/examples/squid)

## Development

To start development you need to:

```bash
npm i
npm start
```

### Test

To start unit tests you need to:

```bash
ganache-cli &
npm run test
```

or to watch for changes

```bash
ganache-cli &
npm run test:watch
```

to create code coverage

```bash
ganache-cli &
npm run test:cover
```

This will start a watcher for changes of the code.

`ganache-cli` can be installed following [this instructions](https://github.com/trufflesuite/ganache-cli#installation).

### Production build

```bash
npm run build
```

### npm releases

For a new **patch release**, execute on the machine where you're logged into your npm account:

```bash
./bumpversion path
```

git tag with the latest version and `git push`

## License

```
Copyright 2018 Ocean Protocol Foundation Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
