import { Cursor } from '@/components/Cursor'
import { BackgroundCanvas } from '@/components/BackgroundCanvas'

function App() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <BackgroundCanvas mode="idle" />
      <Cursor />
      <h1 style={{ position: 'relative', zIndex: 10, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
        DWLOAD
      </h1>
    </div>
  )
}

export default App
