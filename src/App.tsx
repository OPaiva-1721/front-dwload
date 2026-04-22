import { RouterProvider } from 'react-router-dom'
import { Cursor } from '@/components/Cursor'
import { BackgroundCanvas } from '@/components/BackgroundCanvas'
import { router } from '@/app/router'

function App() {
  return (
    <>
      <BackgroundCanvas mode="idle" />
      <Cursor />
      <RouterProvider router={router} />
    </>
  )
}

export default App
