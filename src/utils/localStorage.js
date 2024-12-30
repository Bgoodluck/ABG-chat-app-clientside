export const loadUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
      return null;
    }
  };
  
  export const saveUserToStorage = (userData) => {
    try {
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  };
  