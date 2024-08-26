import { message, result, createDataItemSigner, dryrun } from '@permaweb/aoconnect'

const PROCESS = "MyS1C32c4shlzUOrzLEJpHaIqF0SvGOgLtzkAuRoGzE"

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

function write(data: string, tags: [{ name: string, value: string }], options = {}) {

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
    ],
    ...options
  }).then(id => result({
    process: PROCESS,
    message: id
  })).then(res => res.Output.data)
}

export function complete(id: string, user: string) {
  return write(id.toString(), [{ name: 'Action', value: 'Complete' }], { Owner: user })
}

export function unComplete(id: string, user: string) {
  return write(id.toString(), [{ name: 'Action', value: 'UnComplete' }], { Owner: user })
}


export function list(user: string) {
  return read([{ name: 'Action', value: 'List' }], { Owner: user })
}

export function add(description: string) {
  return write(description, [{ name: 'Action', value: 'Add-Item' }])
}

export function deleteTodo(id: string, user: string) {
  return write(id.toString(), [{ name: 'Action', value: 'Remove' }], { Owner: user })
}