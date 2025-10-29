import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createHashRouter, RouterProvider } from 'react-router'
import Home from './pages/Home.tsx'
import ChatPage from './pages/ChatPage.tsx'

const router = createHashRouter([
  {
  path: '/',
	Component: App,
	children: [
		{
			index: true,
			Component: Home
		},
		{
			path: '/ChatPage',
			Component: ChatPage
		},
	]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
