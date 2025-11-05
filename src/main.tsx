import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createHashRouter, RouterProvider } from 'react-router'
import ChatPage from './pages/ChatPage.tsx'
import Header from './components/header/Header.tsx'
import Login from './components/register/login/Login.tsx'
import Register from './components/register/login/Register.tsx'

const router = createHashRouter([
  {
  path: '/',
	Component: App,
	children: [
		{
			index: true,
			Component: ChatPage
		},
		{
			path: '/chatPage',
			Component: ChatPage
		},
		{
			path: '/header',
			Component: Header
		},
		{
        	path: '/register',
        	Component: Register
      },
      {
        	path: '/login',
        	Component: Login
      }
	]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
