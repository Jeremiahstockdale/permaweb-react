import { message, result, createDataItemSigner, dryrun } from '@permaweb/aoconnect'

const PROCESS = "1yjnAj2goZZs7DbjVOUDNUA1oCscb1SegZ1_vBiDzs8"

function read(tags: [{ name: string, value: string }], options = {}) {
  return dryrun({
    process: PROCESS,
    data: "",
    tags: [
      { name: 'Data-Protocol', value: 'ao' },
      { name: 'Variant', value: 'ao.TN.1' },
      { name: 'Type', value: 'Message' },
      ...tags
    ],
    ...options
  }).then(res => res.Output.data)
}

function write(data: string, tags: [{ name: string, value: string }]) {

  return message({
    process: PROCESS,
    // @ts-ignore
    signer: createDataItemSigner(globalThis.arweaveWallet),
    data: data,
    tags: [
      { name: 'Data-Protocol', value: 'ao' },
      { name: 'Variant', value: 'ao.TN.1' },
      { name: 'Type', value: 'Message' },
      ...tags
    ]
  }).then(id => result({
    process: PROCESS,
    message: id
  })).then(res => res.Output.data)
}

export function list(user: string) {
  return read([{ name: 'Action', value: 'List' }], { Owner: user })
}

export function add(description: string) {
  return write(description, [{ name: 'Action', value: 'Add-Item' }])
}
