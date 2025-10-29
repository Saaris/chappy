
import { NavLink, Outlet } from 'react-router'
import './App.css'

function App() {
 
  return (
    <>
      <div>
        <header>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/ChatPage">ChatPage</NavLink>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  )
}

export default App
