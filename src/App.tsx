import { Outlet } from 'react-router'
import './App.css'
import Header from './components/header/Header.tsx'
import { useEffect } from "react";
import { useUserStore } from "./frontenddata/userStore";

function App() {
  useEffect(() => {
    useUserStore.getState().initialize();
  }, []);

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
