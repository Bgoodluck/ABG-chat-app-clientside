import React, { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { summaryApi } from '../../common';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser } from '../../redux/userSlice';
import Sidebar from '../../components/Sidebar/Sidebar';
import logo from '../../asset/logo2.png';
import { useSocketStable } from './useSocketStable';

// Disable React.StrictMode double-invocation in development
if (process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes('StrictMode')) return;
    originalConsoleError.apply(console, args);
  };
}

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.user);
  
  // Create stable token reference
  const token = useMemo(() => localStorage.getItem('token'), []);
  
  // Initialize socket with stable configuration
  const socket = useSocketStable(token);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(summaryApi.userDetails.url, {
        method: summaryApi.userDetails.method,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const userData = responseData.data.data || responseData.data;
        if (userData) {
          dispatch(setUser({
            _id: userData._id || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            picture: userData.picture || ''
          }));
        }
      }

      if (responseData.data?.logout) {
        handleLogout();
      }
      
    } catch (error) {
      console.error("Error fetching user details:", error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/email');
  };

  // Fetch user details on mount
  useEffect(() => {
    if (!token) {
      handleLogout();
      return;
    }
    fetchUserDetails();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Log socket and user state for debugging
  useEffect(() => {
    console.log("Socket Status:", socket?.connected);
    console.log("Redux UserDetails:", user);
  }, [socket?.connected, user]);

  const basePath = location.pathname === '/';

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath && 'hidden'}`}>
        <Outlet />
      </section>

      <div className={`justify-center items-center flex-col gap-3 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
        <div>
          <img
            src={logo}
            alt="Logo"
            width={200}
            height={200}
            className='rounded-full shadow-lg' 
          />
        </div>
        <p className='text-lg mt-2 text-slate-500'>
          Select user to send message
        </p>
      </div>
    </div>
  );
}

export default Home;