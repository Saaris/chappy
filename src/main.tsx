import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createHashRouter, RouterProvider } from 'react-router'
import Home from './pages/Home.tsx'
import ChatPage from './pages/ChatPage.tsx'
import Header from './components/header/Header.tsx'
import Login from './components/login/Login.tsx'
import Register from './components/register/Register.tsx'

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
