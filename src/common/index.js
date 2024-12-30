const backendUrl = process.env.REACT_APP_BACKEND_URL;


export const summaryApi = {
    register: {
        url: `${backendUrl}/api/user/register`,
        method: 'POST'
    },
    email: {
        url: `${backendUrl}/api/user/email`,
        method: 'POST'
    },
    password: {
        url: `${backendUrl}/api/user/password`,
        method: 'POST'
    },
    userDetails: {
        url: `${backendUrl}/api/user/user-details`,
        method: 'GET'
    },
    updateUser: {
        url: `${backendUrl}/api/user/update`,
        method: 'POST'
    },

    searchUser: {
        url: `${backendUrl}/api/user/search`,
        method: 'POST'
    }
}