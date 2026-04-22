import { Cursor } from '@/components/Cursor'

function App() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Cursor />
      <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
        DWLOAD
      </h1>
    </div>
  )
}

export default App
