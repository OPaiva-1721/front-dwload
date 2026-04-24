import { RouterProvider } from 'react-router-dom'
import { Cursor } from '@/components/Cursor'
import { BackgroundCanvas } from '@/components/BackgroundCanvas'
import { Providers } from '@/app/providers'
import { router } from '@/app/router'

function App() {
  return (
    <Providers>
      <BackgroundCanvas mode="idle" />
      <Cursor />
      <RouterProvider router={router} />
    </Providers>
  )
}

export default App
