import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Avatar from '../UsersAvatar/Avatar';
import { FaPhone, FaEnvelope } from 'react-icons/fa';
import { BiMessageDetail } from 'react-icons/bi';
import { MdNavigateNext, MdNavigateBefore } from 'react-icons/md';
import { TbMessageChatbotFilled } from "react-icons/tb";
import { useNavigate, useParams } from 'react-router-dom';

const AllUsersDetail = () => {
  // Memoize selector to prevent unnecessary rerenders
  const currentUserId = useSelector((state) => state.user._id);
  const socket = window.socket;
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate()
  const { userId } = useParams();

  // Calculate number of cards to show based on screen width
  const cardsToShow = useMemo(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAllUsers = (users) => {
      const filteredUsers = users.filter(u => u._id !== currentUserId);
      setAllUsers(filteredUsers);
      setSelectedUser(filteredUsers[0]);
      setIsLoading(false);
    };

    socket.emit('fetch-all-users');
    socket.on('all-users', handleAllUsers);

    return () => socket.off('all-users', handleAllUsers);
  }, [socket, currentUserId]);

  const handleNext = () => {
    if (startIndex + cardsToShow < allUsers.length) {
      setStartIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };


  const handleChatNavigation = async (targetUserId) => {
    if (!targetUserId) {
      console.error('No target user ID provided');
      return;
    }
  
    // Get socket from window and verify connection
    const socket = window.socket;
    if (!socket) {
      console.error('Socket not initialized');
      return;
    }
  
    // Wait for socket connection if needed
    if (!socket.connected) {
      console.log('Waiting for socket connection...');
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Socket connection timeout'));
          }, 5000);
  
          socket.connect();
          
          socket.once('connect', () => {
            clearTimeout(timeout);
            resolve();
          });
  
          socket.once('connect_error', (error) => {
            clearTimeout(timeout);
            reject(error);
          });
        });
      } catch (error) {
        console.error('Failed to establish socket connection:', error);
        return;
      }
    }
  
    // Initialize chat
    try {
      // Use Promise.all with timeout for both requests
      await Promise.all([
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('User details timeout'));
          }, 5000);
  
          socket.emit("get-user-details", targetUserId);
          socket.once("user-details", (data) => {
            clearTimeout(timeout);
            resolve(data);
          });
        }),
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Message history timeout'));
          }, 5000);
  
          socket.emit("fetch-message-history", {
            conversationId: targetUserId,
            page: 1,
            limit: 50
          });
          socket.once("message-history", (data) => {
            clearTimeout(timeout);
            resolve(data);
          });
        })
      ]);
  
      // Navigate only after data is initialized
      navigate(`/message/${targetUserId}`);
    } catch (error) {
      console.error('Error initializing chat:', error);
      // You could show an error message to the user here
    }
  };





  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!selectedUser) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900">
      {/* Background Image/Details Section */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 transition-all duration-500"
        style={{
          backgroundImage: selectedUser.picture ? `url(${selectedUser.picture})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        
        {/* User Details */}
        <div className="relative z-10 p-4 md:p-8 lg:p-12 text-white max-w-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0 mb-8">
            <div className='flex justify-between'>
            <Avatar
              width={100}
              height={100}
              firstName={selectedUser.firstName}
              lastName={selectedUser.lastName}
              imageUrl={selectedUser.picture}
              userId={selectedUser._id}
            />
            <TbMessageChatbotFilled
    onClick={() => selectedUser._id && handleChatNavigation(selectedUser._id)}
    className="text-2xl cursor-pointer hover:text-blue-500 transition-colors"
  />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                {selectedUser.firstName} {selectedUser.lastName}
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                {selectedUser.statusMessage || "No status message"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-xl" />
              <span className="text-sm md:text-base break-all">{selectedUser.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaPhone className="text-xl" />
              <span className="text-sm md:text-base">{selectedUser.phone || "No phone number"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <BiMessageDetail className="text-xl" />
              <span className="text-sm md:text-base">{selectedUser.statusMessage || "No status message"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="absolute bottom-0 right-0 p-4 md:p-8 w-full bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex justify-center md:justify-end items-center space-x-2 md:space-x-4">
          <button 
            onClick={handlePrev}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={startIndex === 0}
          >
            <MdNavigateBefore size={24} className="text-white" />
          </button>
          
          <div className="flex space-x-2 md:space-x-4 overflow-hidden">
            {allUsers.slice(startIndex, startIndex + cardsToShow).map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`cursor-pointer transition-transform duration-300 transform hover:scale-105 ${
                  selectedUser._id === user._id ? 'ring-2 ring-white' : ''
                }`}
              >
                <div className="w-32 sm:w-40 md:w-48 h-48 md:h-64 rounded-lg overflow-hidden relative">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
                  <div className="absolute bottom-0 left-0 p-3 md:p-4 text-white">
                    <p className="font-semibold text-sm md:text-base">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs md:text-sm text-gray-300 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={startIndex + cardsToShow >= allUsers.length}
          >
            <MdNavigateNext size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllUsersDetail;