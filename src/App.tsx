import { Outlet } from 'react-router'
import './App.css'
import Header from './components/header/Header.tsx'

function App() {
 
  return (
    <>
      <div>
        <header>
          <Header />
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  )
}

export default App
