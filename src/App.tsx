import { Outlet } from 'react-router'
import './App.css'
import Header from './components/header/Header.tsx'

function App() {
  return (
    <>
      <header>
        <Header />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App
