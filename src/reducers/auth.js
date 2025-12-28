import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
  LOGOUT
} from "../actions/auth";

const initialState = {
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  userId: localStorage.getItem("userId") || null,
  expireTime: null,
  username: null,
  email: null,
  loading: false,
  error: null,
  role: null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case LOGIN_SUCCESS:
      localStorage.setItem("accessToken", action.payload.access);
      localStorage.setItem("refreshToken", action.payload.refresh);
      localStorage.setItem("userId", action.payload.user_id);
      localStorage.setItem("username", action.payload.username);
      localStorage.setItem("role", action.payload.role_name);
      localStorage.setItem("expireTime", Math.floor(Date.now() / 1000) + 5*60); //5 mins
      return {
        ...state,
        accessToken: action.payload.access,
        refreshToken: action.payload.refresh,
        userId: action.payload.user_id,
        username: action.payload.username,
        email: action.payload.email,
        loading: false,
        role: action.payload.role_name
      };

    case LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case REFRESH_TOKEN_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case REFRESH_TOKEN_SUCCESS:
      localStorage.setItem("accessToken", action.payload);
      return { ...state, accessToken: action.payload, loading: false };      

    case LOGOUT:
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("expireTime");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      return { ...state, accessToken: null, refreshToken: null, userId: null, username: null, email: null };

    default:
      return state;
  }
};

export default authReducer;