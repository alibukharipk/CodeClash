import store from "../store/store";
import { loginRequest, logout } from "../actions/auth.js";

class AuthService {
  static inactivityTimeout;
  static inactivityTime = 30 * 60 * 1000; // 30 minutes

  static async login(credentails) {
    store.dispatch(loginRequest(credentails));
  }

  static isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  static isTokenExpired() {
    const token = localStorage.getItem('accessToken');
    const expireTime = localStorage.getItem('expireTime');
    if (!token) return true;
      const currentTime = Date.now() / 1000; // in seconds
      return expireTime < currentTime;
  }

  static setAutoLogout = () => {
    const expiryTime = parseInt(localStorage.getItem('expireTime'), 10) * 1000; // Convert to ms
    const currentTime = Date.now(); // In ms
    const timeout = expiryTime - currentTime;
  
    if (timeout > 0) {
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('expireTime');
        alert('Session expired. Please log in again.');
        window.location.href = '/login';
      }, timeout);
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('expireTime');
      window.location.href = '/login';
    }
  };

  static initInactivityTimer = () => {
    const resetTimer = () => {
      if (AuthService.inactivityTimeout) {
        clearTimeout(AuthService.inactivityTimeout);
      }

      AuthService.inactivityTimeout = setTimeout(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('expireTime');
        alert('Session expired due to inactivity.');
        window.location.href = '/login';
      }, AuthService.inactivityTime);
    };

    // Attach event listeners to reset the timer on interaction
    ['mousemove', 'keydown', 'click', 'scroll'].forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Start the timer immediately
  };

  static logout() {
    store.dispatch(logout());
  }
}

export default AuthService;