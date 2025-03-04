/* global Pear */
/** @typedef {import('pear-interface')} */

import path from 'path'
import process from 'process'
import Hyperswarm from 'hyperswarm'
import Hypercore from 'hypercore'
import b4a from 'b4a'

const { updates, reload, teardown } = Pear

updates(() => reload())

const swarm = new Hyperswarm()
teardown(() => swarm.destroy())

export async function createCoreWriter ({ name = 'writer' } = {}) {
  console.log('starting writer', name)
  const core = new Hypercore(path.join(Pear.config.storage, name))
  await core.ready()
  
  process.stdin.on('data', (data) => core.append(data))

  console.log('joining', b4a.toString(core.discoveryKey, 'hex'))
  swarm.join(core.discoveryKey)
  swarm.on('connection', conn => core.replicate(conn))

  return b4a.toString(core.key, 'hex')
}

export async function createCoreReader ({ name = 'reader', coreKeyWriter, onData } = {}) {
  console.log('starting reader', name, coreKeyWriter)
  const core = new Hypercore(path.join(Pear.config.storage, name), coreKeyWriter)
  await core.ready()

  console.log('joining', b4a.toString(core.discoveryKey, 'hex'))
  swarm.join(core.discoveryKey)
  swarm.on('connection', conn => core.replicate(conn))
  
  const foundPeers = core.findingPeers()
  swarm.flush().then(() => foundPeers())

  await core.update()

  let position = core.length
  for await (const block of core.createReadStream({ start: core.length, live: true })) {
    onData({ position, block })
  }
}
