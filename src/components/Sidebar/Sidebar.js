import React, { useEffect, useState, useCallback } from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus, FaUsers } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { FaIdCard } from "react-icons/fa6";
import { BiLogOut } from "react-icons/bi";
import Avatar from "../UsersAvatar/Avatar";
import { useDispatch, useSelector } from "react-redux";
import EditUserDetails from "../UserDetails/EditUserDetails";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "../UserDetails/SearchUser";
import { BsImage, BsCameraVideo } from "react-icons/bs"; 
import { logout } from "../../redux/userSlice";
import { setCurrentViewProfile, setActiveProfiles } from "../../redux/userSlice"
import { LiaUsersSolid } from 'react-icons/lia';

function Sidebar() {
    const socket = window.socket;
    const isConnected = useSelector((state) => state.user.socketConnection);
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const [editUserOpen, setEditUserOpen] = useState(false);
    const [openSearchUser, setOpenSearchUser] = useState(false);
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [activeChats, setActiveChats] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [lastMessages, setLastMessages] = useState({});
    const [sortedChats, setSortedChats] = useState([]);




    // Helper function to sort chats by message timestamp
    const sortChatsByLastMessage = useCallback((chats, messages) => {
        return [...chats].sort((a, b) => {
            const messageA = messages[a._id];
            const messageB = messages[b._id];
            
            if (!messageA && !messageB) return 0;
            if (!messageA) return 1;
            if (!messageB) return -1;
            
            return new Date(messageB.timestamp) - new Date(messageA.timestamp);
        });
    }, []);



    // Memoized function to fetch message history
    const fetchMessageHistory = useCallback(() => {
        if (!socket || !isConnected) return;
        
        setIsLoading(true);
        socket.emit('fetch-message-history', {
            page: 1,
            limit: 50
        });
    }, [socket, isConnected]);

    // Handle socket events
    useEffect(() => {
        if (!isConnected || !socket) return;

        // Listen for online users with debounce
        let onlineUsersTimeout;
        socket.on('onlineUsers', (users) => {
            clearTimeout(onlineUsersTimeout);
            onlineUsersTimeout = setTimeout(() => {
                setOnlineUsers(new Set(users.map(u => u._id)));
            }, 300);
        });

        console.log("onlineonline", onlineUsers)

        // Handle message history more efficiently
        socket.on('message-history', (data) => {
            const uniqueUsers = new Map();
            const lastMessagesMap = {};
            
            data.messages?.forEach(message => {
                const otherUserId = message.sender._id === user._id ? 
                    message.receiver : 
                    message.sender._id;

                if (!uniqueUsers.has(otherUserId)) {
                    const chatUser = allUsers.find(u => u._id === otherUserId);
                    if (chatUser) {
                        uniqueUsers.set(otherUserId, chatUser);
                        // Store the last message for this chat
                        lastMessagesMap[otherUserId] = message;
                    }
                }
            });

            const activeChatsArray = Array.from(uniqueUsers.values());
            const sortedActiveChats = sortChatsByLastMessage(activeChatsArray, lastMessagesMap);

            setLastMessages(lastMessagesMap);
            setSortedChats(sortedActiveChats);
            setActiveChats(Array.from(uniqueUsers.values()));
            setIsLoading(false);
        });

        // Handle new messages more efficiently
        socket.on('new-message', (data) => {
            if (data.message.sender._id !== user._id) {
                setUnreadMessages(prev => ({
                    ...prev,
                    [data.message.sender._id]: (prev[data.message.sender._id] || 0) + 1
                }));

                setLastMessages(prev => {
                    const updated = {
                        ...prev,
                        [data.message.sender._id]: data.message
                    };
                    return updated;
                });
                
                setActiveChats(prev => {
                    const senderId = data.message.sender._id;
                    if (!prev.some(chat => chat._id === senderId)) {
                        const newChatUser = allUsers.find(u => u._id === senderId);
                        return newChatUser ? [newChatUser, ...prev] : prev;
                    }
                    return prev;
                });
            }
            console.log("UnreadMessages", lastMessages)
        });

        // Fetch initial data
        fetchMessageHistory();

        // Cleanup
        return () => {
            clearTimeout(onlineUsersTimeout);
            socket.off('onlineUsers');
            socket.off('message-history');
            socket.off('new-message');
        };
    }, [isConnected, socket, user._id, allUsers, fetchMessageHistory, sortChatsByLastMessage]); // eslint-disable-line react-hooks/exhaustive-deps


     // Update sortedChats whenever lastMessages or activeChats change
    useEffect(() => {
        setSortedChats(sortChatsByLastMessage(activeChats, lastMessages));
    }, [lastMessages, activeChats, sortChatsByLastMessage]);


    // Fetch all users only when showing all users view
    useEffect(() => {
        if (!socket || !isConnected || !showAllUsers) return;
        
        setIsLoading(true);
        socket.emit('fetch-all-users');

        const handleAllUsers = (users) => {
            const filteredUsers = users.filter(u => u._id !== user._id);
            setAllUsers(filteredUsers);
            setIsLoading(false);
        };

        socket.on('all-users', handleAllUsers);

        return () => socket.off('all-users', handleAllUsers);
    }, [socket, isConnected, showAllUsers, user._id]);



    // const handleUserClick = useCallback((userId) => {
    //     setUnreadMessages(prev => ({
    //         ...prev,
    //         [userId]: 0
    //     }));
    //     navigate(`/message/${userId}`);
    // }, [navigate]);



    const handleLogout = ()=>{
        dispatch(logout())
        navigate('/email');
        localStorage.clear()
    }

    //     handle viewing active chat profiles
    const handleViewProfiles = () => {
        const activeProfiles = activeChats.map(chat => {
            // First try to get full user data from allUsers if available
            const fullUserData = allUsers.find(u => u._id === chat._id) || chat;
            
            return {
                _id: chat._id,
                firstName: chat.firstName,
                lastName: chat.lastName,
                picture: chat.picture || "",
                phone: fullUserData.phone || chat.phone || "",
                statusMessage: fullUserData.statusMessage || chat.statusMessage || "",
                email: fullUserData.email || chat.email || "",
                socialProfiles: {
                    twitter: fullUserData.socialProfiles?.twitter || chat.socialProfiles?.twitter || "",
                    facebook: fullUserData.socialProfiles?.facebook || chat.socialProfiles?.facebook || "",
                    instagram: fullUserData.socialProfiles?.instagram || chat.socialProfiles?.instagram || "",
                    linkedin: fullUserData.socialProfiles?.linkedin || chat.socialProfiles?.linkedin || "",
                    abgMrkt: fullUserData.socialProfiles?.abgMrkt || chat.socialProfiles?.abgMrkt || "",
                    abgsocial: fullUserData.socialProfiles?.abgsocial || chat.socialProfiles?.abgsocial || ""
                },
                bgColor: generateRandomColor()
            };
        });
    
        // Debug logging
        console.log("Mapped active profiles:", activeProfiles);
    
        dispatch(setActiveProfiles(activeProfiles));
        if (activeProfiles.length > 0) {
            dispatch(setCurrentViewProfile(activeProfiles[0]));
        }
        navigate('/hero');
    };
    
      const handleUserClick = useCallback((userId) => {
        setUnreadMessages(prev => ({
          ...prev,
          [userId]: 0
        }));
    
        const userProfile = allUsers.find(user => user._id === userId);
        if (userProfile) {
          const profileData = {
            _id: userProfile._id,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            picture: userProfile.picture || "",
            phone: userProfile.phone || "",
            statusMessage: userProfile.statusMessage || "",
            email: userProfile.email,
            socialProfiles: userProfile.socialProfiles || {
              twitter: "",
              facebook: "",
              instagram: "",
              linkedin: "",
              abgMrkt: "",
              abgsocial: ""
            },
            bgColor: generateRandomColor()
          };
          dispatch(setCurrentViewProfile(profileData));
          console.log("profileData", profileData)
        }
        
        navigate(`/message/${userId}`);
      }, [navigate, dispatch, allUsers]);
    
      // Helper function to generate random colors
      const generateRandomColor = () => {
        const colors = ['#e85955', '#4A90E2', '#50C878', '#9B59B6', '#F1C40F'];
        return colors[Math.floor(Math.random() * colors.length)];
      };


    const renderMessagePreview = (userId) => {
        const lastMessage = lastMessages[userId];
        
        if (!lastMessage) {
            return (
                <p className="text-sm text-gray-500 truncate">
                    Click to continue chat
                </p>
            );
        }

        switch (lastMessage.type) {
            case 'video':
                return (
                    <div className="flex items-center text-sm text-gray-500 space-x-1">
                        <BsCameraVideo className="text-blue-500" />
                        <span>Video</span>
                    </div>
                );
            case 'image':
                return (
                    <div className="flex items-center text-sm text-gray-500 space-x-1">
                        <BsImage className="text-blue-500" />
                        <span>Image</span>
                    </div>
                );
            default:
                return (
                    <p className="text-sm text-gray-500 truncate">
                        {lastMessage.content}
                    </p>
                );
        }
    };

    const renderUserList = () => {
        const usersToDisplay = showAllUsers ? allUsers : sortedChats;

        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            );
        }

        return usersToDisplay.length > 0 ? (
            <div className="flex flex-col space-y-2 p-4">
                {usersToDisplay.map((userItem) => (
                    <div
                        key={userItem._id}
                        onClick={() => handleUserClick(userItem._id)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 cursor-pointer relative transition-colors duration-200"
                    >
                        <div className="relative">
                            <Avatar
                                width={40}
                                height={40}
                                firstName={userItem.firstName}
                                lastName={userItem.lastName}
                                imageUrl={userItem.picture}
                                userId={userItem._id}
                            />
                            <div 
                                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors duration-300 ${
                                    onlineUsers.has(userItem._id) ? 'bg-green-500' : 'bg-gray-300'
                                }`} 
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium">{`${userItem.firstName} ${userItem.lastName}`}</h3>
                            {!showAllUsers && renderMessagePreview(userItem._id)}
                        </div>
                        {unreadMessages[userItem._id] > 0 && (
                            <div className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5">
                                {unreadMessages[userItem._id]}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <div className="mt-12">
                <div className="flex justify-center items-center my-4 text-slate-400">
                    <FiArrowUpLeft size={50} />
                </div>
                <p className="text-lg text-center text-slate-400">
                    {showAllUsers ? "No users found" : "No active chats yet"}
                </p>
            </div>
        );
    };
    return (
        <div className="w-full h-full grid grid-cols-[48px,1fr] bg-white">
            {/* Sidebar navigation */}
            <div className="bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between">
                <div className="space-y-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `w-12 h-12 cursor-pointer hover:bg-slate-200 rounded flex justify-center items-center transition-colors duration-200 ${
                                isActive && "bg-slate-200"
                            }`
                        }
                        title="chat"
                    >
                        <IoChatbubbleEllipses size={20} />
                    </NavLink>
                    <NavLink
  to="/allusers"
  className={({ isActive }) =>
    `w-12 h-12 cursor-pointer hover:bg-slate-200 rounded flex justify-center items-center transition-colors duration-200 ${
      isActive && "bg-slate-200"
    }`
  }
  title="all users"
>
  <LiaUsersSolid size={20} />
</NavLink>
                    <div
  title="view profiles"
  onClick={handleViewProfiles}
  className="w-12 h-12 cursor-pointer hover:bg-slate-200 rounded flex justify-center items-center"
>
  <FaIdCard size={20} />
</div>

                    <div
                        title="toggle users view"
                        onClick={() => setShowAllUsers(!showAllUsers)}
                        className={`w-12 h-12 cursor-pointer hover:bg-slate-200 rounded flex justify-center items-center transition-colors duration-200 ${
                            showAllUsers && "bg-slate-200 text-blue-600"
                        }`}
                    >
                        <FaUsers size={20} />
                    </div>

                    <div
                        title="add friend"
                        onClick={() => setOpenSearchUser(true)}
                        className="w-12 h-12 cursor-pointer hover:bg-slate-200 rounded flex justify-center items-center transition-colors duration-200"
                    >
                        <FaUserPlus size={20} />
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button
                        className="mx-auto"
                        title={`${user.firstName} ${user.lastName}`}
                        onClick={() => setEditUserOpen(true)}
                    >
                        <Avatar
                            width={40}
                            height={40}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            imageUrl={user?.picture}
                            userId={user?._id}
                        />
                    </button>
                    <button
                        title="logout"
                        onClick={handleLogout}
                        className="w-12 h-12 cursor-pointer hover:bg-slate-200 rounded flex justify-center items-center transition-colors duration-200"
                    >
                        <span className="-ml-2">
                            <BiLogOut size={20} />
                        </span>
                    </button>
                </div>
            </div>

            {/* Main content area */}
            <div className="w-full">
                <div className="h-16 flex items-center justify-between px-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {showAllUsers ? "All Users" : "Messages"}
                    </h2>
                    {!showAllUsers && activeChats.length > 0 && (
                        <div className="text-sm text-gray-500">
                            {activeChats.length} active {activeChats.length === 1 ? 'chat' : 'chats'}
                        </div>
                    )}
                </div>
                <div className="bg-slate-200 p-[0.5px]" />

                <div className="h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar">
                    {renderUserList()}
                </div>
            </div>

             {/* Modals */}
    {editUserOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <EditUserDetails
                onClose={() => setEditUserOpen(false)}
                user={user}
                className="relative z-50"
            />
        </div>
    )}

    {openSearchUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <SearchUser
                onClose={() => setOpenSearchUser(false)}
                className="relative z-50"
            />
        </div>
    )}
        </div>
    );
}

export default Sidebar;