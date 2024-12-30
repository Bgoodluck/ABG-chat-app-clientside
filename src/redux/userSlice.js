// import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//     _id: "",
//   firstName: "",
//   lastName: "",
//   email: "",
//   picture: "",
//   token: "",  
// }

// export const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     setUser: (state, action)=>{
//         state._id = action.payload._id
//         state.firstName = action.payload.firstName
//         state.lastName = action.payload.lastName
//         state.email = action.payload.email
//         state.picture = action.payload.picture        
//     },
//     setToken: (state, action)=>{
//         state.token = action.payload
//     },
//     logout: (state, action)=>{
//         state._id = ""
//         state.firstName = ""
//         state.lastName = ""
//         state.email = ""
//         state.picture = ""
//         state.token = ""
//     }
//   },
// })

// // Action creators are generated for each case reducer function
// export const {
//     setUser,
//     setToken,
//     logout 
//  } = userSlice.actions

// export default userSlice.reducer


// import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   _id: "",
//   firstName: "",
//   lastName: "",
//   email: "",
//   picture: "",
//   token: "",  
//   onlineUsers: [],
//   // socketConnection: null,
//   lastActive: null,
//   userStatus: "online",
//   socketConnection: false,
// }

// export const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     setUser: (state, action) => {
      
//       const payload = action.payload || {};
//       state._id = payload._id || "";
//       state.firstName = payload.firstName || "";
//       state.lastName = payload.lastName || "";
//       state.email = payload.email || "";
//       state.picture = payload.picture || "";
//       state.lastActive = payload.lastActive || null;

//     },
//     setToken: (state, action) => {
//       state.token = action.payload || "";
//     },
//     setOnlineUsers: (state, action) => {
//       state.onlineUsers = action.payload.map(user => ({
//         _id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         picture: user.picture,
//         lastActive: user.lastActive,
//         status: user.status || "online"
//       }));
//     },
//     setSocketConnection: (state, action) => {
//       state.socketConnection = action.payload
//     },
//     setUserStatus: (state, action) => {
//       state.userStatus = action.payload;
//     },
//     updateLastActive: (state) => {
//       state.lastActive = new Date().toISOString();
//     },
//     // setSocketConnection: (state, action) => {
//     //   state.socketConnection = action.payload
//     // },
//     logout: (state) => {
//       return initialState; 
//     }    
//   },
// })

// export const {
//   setUser,
//   setToken,
//   logout,
//   setOnlineUsers,
//   setSocketConnection,
//   setUserStatus,
//   updateLastActive,
  
// } = userSlice.actions

// export default userSlice.reducer



import { createSlice } from '@reduxjs/toolkit';
import { loadUserFromStorage, saveUserToStorage } from '../utils/localStorage';

const storedUser = loadUserFromStorage();

const initialState = {
  _id: storedUser?._id || "",
  firstName: storedUser?.firstName || "",
  lastName: storedUser?.lastName || "",
  email: storedUser?.email || "",
  picture: storedUser?.picture || "",
  token: storedUser?.token || "",
  statusMessage: storedUser?.statusMessage || "",
  phone: storedUser?.phone || "",
  socialProfiles: {
    twitter: storedUser?.socialProfiles?.twitter || "",
    facebook: storedUser?.socialProfiles?.facebook || "",
    instagram: storedUser?.socialProfiles?.instagram || "",
    linkedin: storedUser?.socialProfiles?.linkedin || "",
    abgMrkt: storedUser?.socialProfiles?.abgMrkt || "",
    abgsocial: storedUser?.socialProfiles?.abgsocial || "",
  },
  onlineUsers: [],
  lastActive: storedUser?.lastActive || null,
  userStatus: storedUser?.userStatus || "online",
  socketConnection: false,
  connectionState: 'disconnected',
  activeProfiles: [],
  currentViewProfile: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const payload = action.payload || {};
      
      // Basic user info
      state._id = payload._id || state._id;
      state.firstName = payload.firstName || state.firstName;
      state.lastName = payload.lastName || state.lastName;
      state.email = payload.email || state.email;
      state.picture = payload.picture || state.picture;
      state.lastActive = payload.lastActive || state.lastActive;
      
      // New fields
      state.statusMessage = payload.statusMessage || state.statusMessage;
      state.phone = payload.phone || state.phone;
      
      // Social profiles with nested object handling
      state.socialProfiles = {
        twitter: payload.socialProfiles?.twitter || state.socialProfiles.twitter,
        facebook: payload.socialProfiles?.facebook || state.socialProfiles.facebook,
        instagram: payload.socialProfiles?.instagram || state.socialProfiles.instagram,
        linkedin: payload.socialProfiles?.linkedin || state.socialProfiles.linkedin,
        abgMrkt: payload.socialProfiles?.abgMrkt || state.socialProfiles.abgMrkt,
        abgsocial: payload.socialProfiles?.abgsocial || state.socialProfiles.abgsocial,
      };

      // Save updated state to localStorage
      saveUserToStorage({
        _id: state._id,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        picture: state.picture,
        token: state.token,
        statusMessage: state.statusMessage,
        phone: state.phone,
        socialProfiles: state.socialProfiles,
        lastActive: state.lastActive,
        userStatus: state.userStatus
      });
    },
    setToken: (state, action) => {
      state.token = action.payload || "";
      // Save token update to localStorage
      const currentUser = loadUserFromStorage();
      saveUserToStorage({ ...currentUser, token: state.token });
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload.map(user => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        lastActive: user.lastActive,
        status: user.status || "online"
      }));
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload;
    },
    setConnectionState: (state, action) => {
      state.connectionState = action.payload;
    },
    setUserStatus: (state, action) => {
      state.userStatus = action.payload;
      // Save status update to localStorage
      const currentUser = loadUserFromStorage();
      saveUserToStorage({ ...currentUser, userStatus: state.userStatus });
    },
    updateLastActive: (state) => {
      state.lastActive = new Date().toISOString();
      // Save lastActive update to localStorage
      const currentUser = loadUserFromStorage();
      saveUserToStorage({ ...currentUser, lastActive: state.lastActive });
    },
    setActiveProfiles: (state, action) => {
      state.activeProfiles = action.payload;
    },
    setCurrentViewProfile: (state, action) => {
      state.currentViewProfile = action.payload;
    },
    clearCurrentViewProfile: (state) => {
      state.currentViewProfile = null;
    },
    logout: (state) => {
      // Clear localStorage on logout
      localStorage.removeItem('userData');
      return {
        ...initialState,
        activeProfiles: [],
        currentViewProfile: null
      };
    }
  },
});

export const {
  setUser,
  setToken,
  logout,
  setOnlineUsers,
  setSocketConnection,
  setUserStatus,
  updateLastActive,
  setActiveProfiles,
  setCurrentViewProfile,
  clearCurrentViewProfile
} = userSlice.actions;

export default userSlice.reducer;