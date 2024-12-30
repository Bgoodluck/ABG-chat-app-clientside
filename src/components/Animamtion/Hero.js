import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { FaFacebook, FaInstagramSquare, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { SiMediamarkt } from "react-icons/si";
import { TbSocial } from "react-icons/tb";
import { IoMdChatboxes } from "react-icons/io";
import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import { SlideRight } from '../utility/animation';
import { clearCurrentViewProfile } from '../../redux/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../Accessories/Loading';

function Hero() {
  const { activeProfiles, currentViewProfile } = useSelector(state => state.user);
  const isSocketConnected = useSelector((state) => state.user.socketConnection);
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { userId } = useParams();

  const initialProfile = currentViewProfile || (activeProfiles && activeProfiles.length > 0 ? activeProfiles[0] : null);
  const [activeData, setActiveData] = useState(initialProfile);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentViewProfile) {
      setActiveData(currentViewProfile);
    }
  }, [currentViewProfile]);

  useEffect(() => {
    if (!currentViewProfile && activeProfiles && activeProfiles.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % activeProfiles.length);
        setActiveData(activeProfiles[currentIndex]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentIndex, activeProfiles, currentViewProfile]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentViewProfile());
    };
  }, [dispatch]);

  if (!activeData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-xl"><Loading />Loading Please wait......</p>
      </div>
    );
  }


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

  const handleSocialLink = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <motion.section
      initial={{
        backgroundImage: `radial-gradient(circle, ${activeData?.bgColor || '#e85955'} 0%, ${activeData?.bgColor || '#e85955'} 0%)`
      }}
      animate={{
        backgroundImage: `radial-gradient(circle, ${activeData?.bgColor || '#e85955'}aa 0%, ${activeData?.bgColor || '#e85955'} 70%)`
      }}
      transition={{ duration: 0.8 }}
      className='text-white w-full overflow-x-hidden max-h-screen'
    >
      <Navbar />
      <div className='container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-80px)] max-h-[700px] relative'>
        <div className='flex flex-col justify-center py-8 md:py-0 xl:max-w-[500px] order-2 md:order-1'>
          <div className='space-y-5 md:space-y-7 text-center md:text-left'>
            <AnimatePresence mode='wait'>
              <motion.h1
                key={activeData.id}
                variants={SlideRight(0.2)}
                initial="hidden"
                animate="show"
                exit="exit"
                className='text-3xl lg:text-4xl xl:text-5xl font-bold truncate'
              >
                {activeData.firstName} {activeData.lastName}
              </motion.h1>
            </AnimatePresence>

            {activeData.statusMessage && (
              <AnimatePresence mode='wait'>
                <motion.div
                  key={`status-${activeData.id}`}
                  variants={SlideRight(0.4)}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className='text-xl leading-loose text-white/80 overflow-hidden'
                >
                  <span className='text-black block'>Status Message: </span>
                  <div className='line-clamp-3'>{activeData.statusMessage}</div>
                </motion.div>
              </AnimatePresence>
            )}

            {activeData.phone && (
              <AnimatePresence mode='wait'>
                <motion.p
                  key={`phone-${activeData.id}`}
                  variants={SlideRight(0.6)}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className='text-3xl lg:text-4xl xl:text-5xl font-bold truncate'
                >
                  {activeData.phone}
                </motion.p>
              </AnimatePresence>
            )}

            <div className='flex justify-center items-center md:justify-start gap-4 text-3xl'>
              {activeData.socialProfiles?.facebook && (
                <a
                  href={handleSocialLink(activeData.socialProfiles.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='cursor-pointer border rounded-full p-[6px] hover:bg-white/20 transition-colors'
                >
                  <FaFacebook />
                </a>
              )}
              {activeData.socialProfiles?.instagram && (
                <a
                  href={handleSocialLink(activeData.socialProfiles.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='cursor-pointer border rounded-full p-[6px] hover:bg-white/20 transition-colors'
                >
                  <FaInstagramSquare />
                </a>
              )}
              {activeData.socialProfiles?.linkedin && (
                <a
                  href={handleSocialLink(activeData.socialProfiles.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='cursor-pointer border rounded-full p-[6px] hover:bg-white/20 transition-colors'
                >
                  <FaLinkedin />
                </a>
              )}
              {activeData.socialProfiles?.twitter && (
                <a
                  href={handleSocialLink(activeData.socialProfiles.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='cursor-pointer border rounded-full p-[6px] hover:bg-white/20 transition-colors'
                >
                  <FaSquareXTwitter />
                </a>
              )}
              {activeData.socialProfiles?.abgMrkt && (
                <a
                  href={handleSocialLink(activeData.socialProfiles.abgMrkt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='cursor-pointer border rounded-full p-[6px] hover:bg-white/20 transition-colors'
                >
                  <SiMediamarkt />
                </a>
              )}
              {activeData.socialProfiles?.abgsocial && (
                <a
                  href={handleSocialLink(activeData.socialProfiles.abgsocial)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='cursor-pointer border rounded-full p-[6px] hover:bg-white/20 transition-colors'
                >
                  <TbSocial />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center order-1 md:order-2 relative'>
          <AnimatePresence mode='wait'>
            <motion.div
              onClick={() => navigate(`/userprofile/${activeData._id}`, {
                state: { userData: activeData }
              })}
              className="cursor-pointer"
              role="button"
              aria-label="Navigate to user profile"
            >
              <motion.img
                key={activeData.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: easeInOut, delay: 0 }}
                exit={{ opacity: 0, x: -100 }}
                src={activeData.picture}
                alt={`${activeData.firstName} ${activeData.lastName}`}
                className='w-[200px] h-[200px] md:w-[300px] md:h-[300px] xl:w-[400px] xl:h-[400px] relative z-10 mix-blend-multiply border-none rounded-3xl object-cover mt-4'
              />
            </motion.div>
          </AnimatePresence>

          {activeData.email && (
            <AnimatePresence mode='wait'>
              <motion.div
                key={`email-${activeData.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: easeInOut, delay: 0 }}
                exit={{ opacity: 0 }}
                className='text-lg md:text-2xl absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 text-white font-poppins font-extrabold truncate max-w-[90%] mb-4'
              >
                {activeData.email}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div
          onClick={() => activeData?._id && handleChatNavigation(activeData._id)}
          className='absolute bottom-10 right-10 z-[999] cursor-pointer'
        >
          {isSocketConnected ? (
            <IoMdChatboxes className='text-2xl text-white hover:text-gray-300' />
          ) : (
            <div className="animate-pulse">
              <IoMdChatboxes className='text-2xl text-gray-400' />
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

export default Hero;