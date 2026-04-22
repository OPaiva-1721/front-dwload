import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './Layout'

function Placeholder() {
  return null
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Placeholder /> },
      { path: 'history', element: <Placeholder /> },
      { path: 'tweaks', element: <Placeholder /> },
    ],
  },
])
