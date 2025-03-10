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
  console.log('starting writer')
  const core = new Hypercore(path.join(Pear.config.storage, name))
  teardown(() => core.close())
  await core.ready()
  swarm.on('connection', conn => core.replicate(conn))

  swarm.join(core.discoveryKey)
  swarm.flush()

  return core
}

export async function createCoreReader ({ name = 'reader', coreKeyWriter, onData } = {}) {
  console.log('starting reader')
  const core = new Hypercore(path.join(Pear.config.storage, name), coreKeyWriter)
  teardown(() => core.close())
  await core.ready()
  swarm.on('connection', conn => core.replicate(conn))

  const done = core.findingPeers()
  swarm.join(core.discoveryKey)
  swarm.flush().then(done, done)

  await core.update()

  let position = core.length
  core.createReadStream({ start: core.length, live: true }).on('data', (block) => {
    position += 1
    onData({ position, block })
  })
}
