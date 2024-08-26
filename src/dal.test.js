import { test } from 'node:test'
import fs from 'fs'
import { add, list, complete, remove } from './dal.js'
import Arweave from 'arweave'

const arweave = Arweave.init({})

const jwk = JSON.parse(fs.readFileSync('./test-wallet.json', 'utf-8'))
// setting this global to emulate browser
globalThis.arweaveWallet = jwk

test('create todo', async () => {
    await add("Todo 1")
    await add("Todo 2")
    const user = await arweave.wallets.jwkToAddress(globalThis.arweaveWallet)
    const results = await list(user)
    console.log(results)
    await complete(JSON.parse(results)[0].Id)
    await complete(JSON.parse(results)[1].Id)
    
    await remove()
})
