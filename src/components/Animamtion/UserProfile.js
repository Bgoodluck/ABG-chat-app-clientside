import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoMdChatboxes } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFacebook, FaInstagramSquare, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { SiMediamarkt } from "react-icons/si";
import { TbSocial } from "react-icons/tb";
import { IoArrowBack } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(location.state?.userData || null);
  const [sharedMedia, setSharedMedia] = useState({ images: [], videos: [] });
  const isSocketConnected = useSelector((state) => state.user.socketConnection);
  const [loading, setLoading] = useState(false) 
  const [error, setError] = useState(false)
  const socket = window.socket;
  const currentUser = useSelector((state) => state.user);
  const { userId } = useParams();

  useEffect(() => {

   if (!socket || !userId) return;

    const initializeSocket = () => {
      if (!socket || !userId || !currentUser._id) {
        console.log('Waiting for socket initialization...');
        return false;
      }
      return true;
    };

    // Only proceed if socket is ready
    if (!initializeSocket()) {
      return;
    }

    console.log('Socket initialized:', socket);
    console.log('UserId:', userId);
    console.log('CurrentUser:', currentUser);

    // Handler for user details - only update if we don't have data
    const handleUserDetails = (data) => {
      console.log('Received user details:', data);
      setUserData(prev => prev || data);
      setLoading(false);
    };

    // Handler for message history to extract media
    const handleMessageHistory = (data) => {
      const { messages } = data;
      
      // Filter messages between current user and viewed user
      const relevantMessages = messages.filter(msg => 
        (msg.sender._id === userId && msg.receiver === currentUser._id) ||
        (msg.sender._id === currentUser._id && msg.receiver === userId)
      );

      // Extract media from messages
      const images = [];
      const videos = [];
      
      relevantMessages.forEach(msg => {
        if (msg.imageUrl) images.push(msg.imageUrl);
        if (msg.videoUrl) videos.push(msg.videoUrl);
      });

      setSharedMedia({ images, videos });
    };

    // Set up socket event listeners
    try {
      socket.on("user-details", handleUserDetails);
      socket.on("message-history", handleMessageHistory);

      // Request user details and message history
      socket.emit("get-user-details", userId);
      socket.emit("fetch-message-history", {
        page: 1,
        limit: 50
      });
    } catch (error) {
      console.error('Socket error:', error);
      setError('Failed to establish connection');
      setLoading(false);
    }

    // Cleanup listeners
    return () => {
      socket.off("user-details", handleUserDetails);
      socket.off("message-history", handleMessageHistory);
    };
  }, [socket, userId, currentUser._id]); // eslint-disable-line react-hooks/exhaustive-deps




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

  if (!userData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }



  const handleSocialLink = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Back Button */}
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate(-1)}
        >
          <IoArrowBack size={24} />
          <span>Back</span>
        </motion.button>

        {/* Profile Card */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header with background color */}
          <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500" />
          
          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative -mt-16 mb-4"
            >
              <img
                src={userData.picture}
                alt={`${userData.firstName} ${userData.lastName}`}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
              />
             <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className={`absolute bottom-0 right-1/3 text-white p-2 rounded-full shadow-lg ${
      isSocketConnected ? 'bg-blue-500' : 'bg-gray-400'
    }`}
    onClick={() => userId && handleChatNavigation(userId)}
    disabled={!isSocketConnected}
  >
    {isSocketConnected ? (
      <IoMdChatboxes size={24} />
    ) : (
      <div className="animate-pulse">
        <IoMdChatboxes size={24} />
      </div>
    )}
  </motion.button>
            </motion.div>

            {/* User Info */}
            <div className="text-center space-y-4">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-gray-900"
              >
                {userData.firstName} {userData.lastName}
              </motion.h1>

              {userData.statusMessage && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-600 italic"
                >
                  "{userData.statusMessage}"
                </motion.p>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-2 text-gray-700"
              >
                {userData.email && <p>📧 {userData.email}</p>}
                {userData.phone && <p>📱 {userData.phone}</p>}
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center gap-4 text-2xl text-gray-600"
              >
                {userData.socialProfiles?.facebook && (
                  <a href={handleSocialLink(userData.socialProfiles.facebook)} target="_blank" rel="noopener noreferrer">
                    <FaFacebook className="hover:text-blue-600 cursor-pointer" />
                  </a>
                )}
                {userData.socialProfiles?.instagram && (
                  <a href={handleSocialLink(userData.socialProfiles.instagram)} target="_blank" rel="noopener noreferrer">
                    <FaInstagramSquare className="hover:text-pink-600 cursor-pointer" />
                  </a>
                )}
                {userData.socialProfiles?.linkedin && (
                  <a href={handleSocialLink(userData.socialProfiles.linkedin)} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin className="hover:text-blue-800 cursor-pointer" />
                  </a>
                )}
                {userData.socialProfiles?.twitter && (
                  <a href={handleSocialLink(userData.socialProfiles.twitter)} target="_blank" rel="noopener noreferrer">
                    <FaSquareXTwitter className="hover:text-gray-800 cursor-pointer" />
                  </a>
                )}
                {userData.socialProfiles?.abgMrkt && (
                  <a href={handleSocialLink(userData.socialProfiles.abgMrkt)} target="_blank" rel="noopener noreferrer">
                    <SiMediamarkt className="hover:text-red-600 cursor-pointer" />
                  </a>
                )}
                {userData.socialProfiles?.abgsocial && (
                  <a href={handleSocialLink(userData.socialProfiles.abgsocial)} target="_blank" rel="noopener noreferrer">
                    <TbSocial className="hover:text-green-600 cursor-pointer" />
                  </a>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Shared Media Section */}
        {(sharedMedia.images.length > 0 || sharedMedia.videos.length > 0) && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Shared Media</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sharedMedia.images.map((image, index) => (
                <motion.div
                  key={`image-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + (index * 0.1) }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-lg overflow-hidden shadow-md"
                >
                  <img src={image} alt="Shared media" className="w-full h-full object-cover" />
                </motion.div>
              ))}
              {sharedMedia.videos.map((video, index) => (
                <motion.div
                  key={`video-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + ((sharedMedia.images.length + index) * 0.1) }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-lg overflow-hidden shadow-md relative"
                >
                  <video 
                    src={video} 
                    className="w-full h-full object-cover"
                    controls
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UserProfile;