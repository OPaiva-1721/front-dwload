import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './Layout'
import { DownloadPanel } from '@/features/download/components/DownloadPanel'
import { HistoryPage } from '@/features/history/components/HistoryPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DownloadPanel /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'tweaks', element: null },
    ],
  },
])
