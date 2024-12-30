import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "../UsersAvatar/Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import uploadFile from "../../helpers/uploadFile";
import { IoClose } from "react-icons/io5";
import Loading from "../Accessories/Loading";
import wallpaper from '../../asset/background.jpg';
import { MdSend } from "react-icons/md";
import EmojiPicker from 'emoji-picker-react'; 
import { BsEmojiSmile } from 'react-icons/bs';
import { IoCheckmarkDone } from "react-icons/io5";
import { IoCheckmark } from "react-icons/io5";
import moment from "moment/moment";





function MessagePage() {
  const params = useParams();
  const socket = window.socket;
  const isConnected = useSelector((state) => state.user.socketConnection);
  const user = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    picture: "",
    email: "",
    userId: "",
    online: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openMediaUpload, setOpenMediaUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !params.userId) return;

    // Handler for user details
    const handleUserDetails = (data) => {
      console.log("Received user details:", data);
      setUserData(data);
      setLoading(false);
    };

    // Handler for online users
    const handleOnlineUsers = (users) => {
      const isOnline = users.some((user) => user._id === params.userId);
      setUserData((prev) => ({ ...prev, online: isOnline }));
    };

    
    const handleMessageHistory = (data) => {
      const { messages: historyMessages, page } = data;
      // Filter messages to only show those between current user and selected user
      const relevantMessages = historyMessages.filter(msg => 
        (msg.sender._id === params.userId && msg.receiver === user._id) ||
        (msg.sender._id === user._id && msg.receiver === params.userId)
      );
  
      if (page === 1) {
        setMessages(relevantMessages);
      } else {
        setMessages(prev => [...relevantMessages, ...prev]);
      }
      setHasMore(relevantMessages.length === 50);
    };


    const markMessageDelivered = (messageId) => {
      socket.emit('message-delivered', { messageId });
    };

    // Handler for new messages
    const handleNewMessage = (data) => {
      console.log("Received new message:", data);
      if (data.message && data.conversation) {

        const isRelevantMessage = 
        (data.message.sender._id === params.userId && data.message.receiver === user._id) ||
        (data.message.sender._id === user._id && data.message.receiver === params.userId);

      if (isRelevantMessage) {
        markMessageDelivered(data.message._id);
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg._id === data.message._id);
          if (!messageExists) {
            return [...prevMessages, data.message];
          }
          return prevMessages;
        });
      }
    }
  };

  
    // Handle message status updates
    const handleMessageStatusUpdate = (data) => {
      const { messageId, type, userId, timestamp } = data;
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? {
                ...msg,
                status: msg.status.map(status => 
                  status.recipient.toString() === userId.toString()
                    ? { ...status, [type]: timestamp }
                    : status
                )
              }
            : msg
        )
      );
    };


    // Handler for message sent confirmation
    const handleMessageSent = (data) => {
      console.log("Message sent confirmation:", data);
      if (data.message) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    const loadMessages = () => {
      socket.emit("fetch-message-history", {
        conversationId: params.userId, // or your conversation ID if different
        page: 1,
        limit: 50
      });
    };

    loadMessages();
 

    // Handler for message errors
    const handleMessageError = (error) => {
      console.error("Message error:", error);
      setError(error);
    };

    // Set up socket event listeners
    socket.on("user-details", handleUserDetails);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("message-history", handleMessageHistory);
    socket.on('new-message', handleNewMessage);
    socket.on('message-status-update', handleMessageStatusUpdate);
    socket.on("message-sent", handleMessageSent);
    socket.on("message-error", handleMessageError);

    // Request user details
    socket.emit("get-user-details", params.userId);

    // Cleanup listeners on unmount
    return () => {
      socket.off("user-details", handleUserDetails);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off('new-message', handleNewMessage);
      socket.off('message-status-update', handleMessageStatusUpdate);
      socket.off("message-sent", handleMessageSent);
      socket.off("message-error", handleMessageError);
      socket.off("message-history", handleMessageHistory);
    };
  }, [socket, params.userId, user._id, isConnected]);




  // Load more messages on scroll
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore) {
      socket.emit("fetch-message-history", {
        conversationId: params.userId,
        page: page + 1,
        limit: 50
      });
      setPage(prev => prev + 1);
    }
  };




  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socket) {
        const messageData = {
          sender: user._id,
          receiverId: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user._id,
          conversationId: `${user._id}-${params.userId}` 
        };
  
        if (messageData.sender !== messageData.receiverId) {
          console.log("Sending message:", messageData);
          socket.emit("send-message", messageData);
  
          setMessage({
            text: "",
            imageUrl: "",
            videoUrl: "",
          });
        }
      }
    }
  };

  const handleMediaUpload = () => {
    setOpenMediaUpload((prev) => !prev);
  };



  const handleImageUpload = async(e)=>{
    const file = e.target.files[0]

    setLoading(true)
    const uploadPicture = await uploadFile(file)
    setLoading(false) 
    setOpenMediaUpload(false)

    setMessage((prev)=>{
      return(
        {
         ...prev,
          imageUrl: uploadPicture?.url
        }
      )
    })
  }



  const handleMediaUploadClear = ()=>{
    setMessage((prev)=>{
      return(
        {
         ...prev,
          imageUrl: "",
          videoUrl: ""
        }
      )
    })
  }



  const handleVideoUpload = async(e)=>{
    const file = e.target.files[0]
    setLoading(true)
    const uploadVideo = await uploadFile(file)
    setLoading(false)
    setOpenMediaUpload(false)
    
    setMessage((prev)=>{
      return(
        {
         ...prev,
          videoUrl: uploadVideo?.url
        }
      )
    })
  }

  const handleMessageOnChange = (e)=>{
    const { name, value} = e.target

    setMessage((prev)=>{
      return{
       ...prev,
        text: value
      }
    })
  }

  

    // Handle emoji selection
   const onEmojiClick = (emojiObject) => {
    setMessage(prev => ({
      ...prev,
      text: prev.text + emojiObject.emoji
    }));
    setShowEmojiPicker(false);
  };

  // Update message component to show status
  const MessageStatus = ({ status, sender }) => {
    // Handle both cases where sender might be an ID or an object
    const senderId = typeof sender === 'object' ? sender._id : sender;
    if (senderId !== user._id) return null;
    
    const recipientStatus = status?.[0];
    if (!recipientStatus) return null;
  
    if (recipientStatus.seen) {
      return <IoCheckmarkDone className="text-blue-900" />;
    } else if (recipientStatus.delivered) {
      return <IoCheckmarkDone className="text-green-800" />;
    }
    return <IoCheckmark className="text-gray-500" />;
  };

  // Updated render messages with status
  // Update the renderMessages function to handle both formats of sender data
const renderMessages = () => (
  <div 
    className="flex flex-col gap-4 p-4"
    onScroll={handleScroll}
  >
    {messages.map((msg, index) => {
      // Handle both cases where sender might be an ID or an object
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      const isCurrentUser = senderId === user._id;
      const timestamp = moment(msg.timestamp || msg.createdAt);

      return (
        <div
          key={msg._id || index}
          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              isCurrentUser ? 'bg-[#f5b4d5] text-black' : 'bg-white'
            }`}
          >
            {msg.text && <p className="break-words">{msg.text}</p>}
            {msg.imageUrl && (
              <div className="max-w-[300px] max-h-[300px] overflow-hidden rounded-lg mt-2">
                <img
                  src={msg.imageUrl}
                  alt="Sent"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            {msg.videoUrl && (
              <div className="max-w-[300px] max-h-[300px] overflow-hidden rounded-lg mt-2">
                <video
                  src={msg.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-1 text-xs opacity-70 mt-1">
                {timestamp.calendar(null, {
                  sameDay: 'HH:mm',
                  lastDay: '[Yesterday] HH:mm',
                  lastWeek: 'dddd HH:mm',
                  sameElse: 'DD/MM/YYYY HH:mm'
                })}
                <MessageStatus status={msg.status} sender={senderId} />
              </div>
          </div>
        </div>
      );
    })}
    <div ref={messagesEndRef} />
  </div>
);
 

  if (loading) return <div className=""><Loading/>Loading user details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div 
       style={{ backgroundImage : `url(${wallpaper})`}}
       className="bg-no-repeat bg-cover"
    >
      <header className="flex items-center p-4 border-b justify-between bg-white h-16">
        <div className="flex items-center gap-4">
          <Link to={"/"} className="lg:hidden">
            <FaAngleLeft size={25} />
          </Link>
          <div>
            {/* {userData?.picture && ( */}
            <Avatar
              imageUrl={userData?.picture}
              width={50}
              height={50}
              firstName={userData.firstName}
              lastName={userData.lastName}
              userId={userData._id}
              // alt={`${userData.firstName} ${userData.lastName}`}
              className="w-12 h-12 rounded-full"
            />
            {/* )} */}
          </div>
          <div className="ml-4">
            <h2 className="font-semibold">
              {userData.firstName} {userData.lastName}
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  userData.online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              {userData.online ? (
                <span className="text-primary">Online</span>
              ) : (
                <span className="text-slate-400">Offline</span>
              )}
            </div>
          </div>
        </div>
        <div>
          <button className="cursor-pointer">
            <HiDotsVertical />
          </button>
        </div>
      </header>

      {/* show all messages */}
      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-300 bg-opacity-50">
           {/* upload image display */}

          {
            message.imageUrl && (
              <div className="w-full h-full bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
                <div 
                  className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-primary"
                  onClick={handleMediaUploadClear}
                >
                   <IoClose size={30}/>
                </div>
              <div className="bg-white p-3">
                 <img
                   src={message.imageUrl}                  
                   alt="uploadImage"
                   className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"
                 />  
              </div>
           </div>
            )
          }

          {/* upload video display */}
          {
            message.videoUrl && (
              <div className="w-full h-full bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
                <div 
                  className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-primary"
                  onClick={handleMediaUploadClear}
                >
                   <IoClose size={30}/>
                </div>
              <div className="bg-white p-3">
                 <video
                   src={message.videoUrl}
                   controls
                   muted
                   autoPlay                   
                   className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"                   
                 />  
              </div>
           </div>
            )
          }

          {
            loading && (
              <div className="w-full h-full flex justify-center items-center">
                <Loading/>
              </div>
            )
          }

{renderMessages()}  
        
      </section>

      {/* send message */}
      <section className="h-16 bg-white flex items-center px-4">
        <div className="relative">
          <button
            onClick={handleMediaUpload}
            className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white"
          >
            <FaPlus size={20} />
          </button>

          {/* video and image upload */}
          {openMediaUpload && (
            <div className="bg-white shadow rounded absolute bottom-14 w-36 p-2">
              <form>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center p-2 px-3 cursor-pointer gap-3 hover:bg-primary"
                >
                  <div className="text-blue-400">
                    <FaImage size={18} />
                  </div>
                  <p>Image</p>
                </label>
                <label
                  htmlFor="uploadVideo"
                  className="flex items-center p-2 px-3 cursor-pointer gap-3 hover:bg-primary"
                >
                  <div className="text-purple-400">
                    <FaVideo size={18} />
                  </div>
                  <p>Video</p>
                </label>
                <input
                  type="file"
                  id="uploadImage"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <input
                  type="file"
                  id="uploadVideo"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
              </form>
            </div>
          )}
        </div>
        {/* message input tab and emoji */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:text-primary"
          >
            <BsEmojiSmile size={20} />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                disableAutoFocus
                searchPlaceholder="Search emoji..."
                width={300}
              />
            </div>
          )}
        </div>
        <form 
           className="h-full w-full flex gap-2"
           onSubmit={handleSendMessage}
        >
        
           <input
            type="text"
            placeholder="Type a message..."
            className="py-1 px-4 outline-none w-full h-full"
            value={message.text}
            onChange={handleMessageOnChange}
           />
          <button className="hover:text-primary">
              <MdSend size={24} />  
          </button>
        </form>
      </section>
    </div>
  );
}

export default MessagePage;
