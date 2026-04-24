import { RouterProvider } from 'react-router-dom'
import { Cursor } from '@/components/Cursor'
import { BackgroundCanvas } from '@/components/BackgroundCanvas'
import { Providers } from '@/app/providers'
import { TweaksPanel } from '@/features/tweaks/TweaksPanel'
import { useTweaksStore } from '@/features/tweaks/store'
import { router } from '@/app/router'

function AppInner() {
  const { density, speed } = useTweaksStore()

  return (
    <>
      <BackgroundCanvas density={density} speed={speed} mode="idle" />
      <Cursor />
      <TweaksPanel />
      <RouterProvider router={router} />
    </>
  )
}

function App() {
  return (
    <Providers>
      <AppInner />
    </Providers>
  )
}

export default App
