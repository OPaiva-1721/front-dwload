import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './Layout'
import { DownloadPanel } from '@/features/download/components/DownloadPanel'

function Placeholder() {
  return null
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DownloadPanel /> },
      { path: 'history', element: <Placeholder /> },
      { path: 'tweaks', element: <Placeholder /> },
    ],
  },
])
