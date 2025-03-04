/* global alert */
import { useEffect, useState } from 'react'

import { createCoreWriter, createCoreReader } from '../lib/core'

export default function App () {
  const [coreKey, setCoreKey] = useState('')
  
  const [inputCoreKey, setInputCoreKey] = useState('')
  const [joinStatus, setJoinStatus] = useState('')

  const onStartWriter = async () => {
    const key = await createCoreWriter()
    setCoreKey(key)  
  }

  const onStartReader = async () => {
    if (!inputCoreKey) {
      alert('Please enter a core key')
      return
    }
    setJoinStatus('Joining...')
    await createCoreReader({ coreKeyWriter: inputCoreKey, onData: console.log })
    setInputCoreKey('')
    setJoinStatus('Joined')
  }

  return (
    <div style={{ padding: 10, background: 'cyan' }}>
      <h1>MyApp</h1>

      <hr />

      <h2>Writer</h2>
      <button onClick={onStartWriter}>Start writer</button>
      <p>Core key: {coreKey}</p>

      <hr />

      <h2>Reader</h2>
      <p>Core key</p>
      <div>
        <textarea type='text' value={inputCoreKey} onChange={(evt) => setInputCoreKey(evt.currentTarget.value)} />
      </div>
      <button onClick={onStartReader}>Start reader</button>
      <p>Status: {joinStatus}</p>
    </div>
  )
}
