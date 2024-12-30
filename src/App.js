// import logo from './logo.svg';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'
import './App.css';

function App() {
  return (
    <>
    <Toaster/>
      <main>
       <Outlet/>
      </main>
    </>
  );
}

export default App;
