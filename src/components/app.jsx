/* global alert */
import { useState } from 'react'
import b4a from 'b4a'

import { createCoreWriter, createCoreReader } from '../lib/core'

export default function App () {
  const [core, setCore] = useState()
  const [message, setMessage] = useState('')

  const [inputCoreKey, setInputCoreKey] = useState('')
  const [status, setStatus] = useState('')
  const [messsages, setMessages] = useState([])

  const coreKey = core ? b4a.toString(core.key, 'hex') : ''
  const append = (data) => core?.append(data)

  const onStartWriter = async () => {
    const core = await createCoreWriter()
    setCore(core)
  }

  const onStartReader = async () => {
    if (!inputCoreKey) {
      alert('Please enter a core key')
      return
    }
    setStatus('starting...')
    await createCoreReader({ 
      coreKeyWriter: inputCoreKey, 
      onData: (data) => {
        setMessages((msgs) => [...msgs, b4a.toString(data.block, 'utf8')])
      }
    })
    setStatus('started')
  }

  return (
    <div style={{ padding: 10, background: 'cyan' }}>
      <h1>MyApp</h1>

      <h2>Writer</h2>
      <button onClick={onStartWriter}>Start writer</button>
      <p>Core key: {coreKey}</p>

      <h3>Send message</h3>
      <div>
        <textarea type='text' value={message} onChange={(evt) => setMessage(evt.currentTarget.value)} />
      </div>
      <button onClick={() => append(message)}>Send</button>

      <hr />

      <h2>Reader</h2>
      <div>
        <textarea type='text' value={inputCoreKey} onChange={(evt) => setInputCoreKey(evt.currentTarget.value)} />
      </div>
      <button onClick={onStartReader}>Start reader</button>
      <p>Status: {status}</p>
      
      <h3>Receive message</h3>
      {messsages.map((msg, idx) => <p key={idx}>{msg}</p>)}
    </div>
  )
}
