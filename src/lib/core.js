/* global Pear */
/** @typedef {import('pear-interface')} */

import path from 'path'
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

  console.log('joining', b4a.toString(core.discoveryKey, 'hex'))
  swarm.join(core.discoveryKey)
  swarm.on('connection', conn => core.replicate(conn))

  return core
}

export async function createCoreReader ({ name = 'reader', coreKeyWriter, onData } = {}) {
  console.log('starting reader', name, coreKeyWriter)
  const core = new Hypercore(path.join(Pear.config.storage, name), coreKeyWriter)
  await core.ready()

  console.log('joining', b4a.toString(core.discoveryKey, 'hex'))
  const foundPeers = core.findingPeers()
  swarm.join(core.discoveryKey)
  swarm.on('connection', conn => core.replicate(conn))
  swarm.flush().then(() => foundPeers())

  console.log('updating')
  await core.update()

  console.log('reading', core.length)
  let position = core.length
  core.createReadStream({ start: core.length, live: true }).on('data', (block) => {
    position += 1
    onData({ position, block })
  })
}
