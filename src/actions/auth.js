export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const REFRESH_TOKEN_REQUEST = "REFRESH_TOKEN_REQUEST";
export const REFRESH_TOKEN_SUCCESS = "REFRESH_TOKEN_SUCCESS";
export const REFRESH_TOKEN_FAILURE = "REFRESH_TOKEN_FAILURE";
export const LOGOUT = "LOGOUT";

// Action to trigger API call
export const loginRequest = (credentials) => ({
  type: LOGIN_REQUEST,
  payload: credentials,
});

// Action to store fetched Login in Redux
export const loginSuccess = (tokens) => ({
  type: LOGIN_SUCCESS,
  payload: tokens,
});

// Action for handling errors
export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error,
});

export const logout = () => ({
  type: LOGOUT,
});

export const refreshTokenRequest = () => ({
  type: REFRESH_TOKEN_REQUEST,
});

export const refreshTokenSuccess = (accessToken) => ({
  type: REFRESH_TOKEN_SUCCESS,
  payload: accessToken,
});

export const refreshTokenFailure = () => ({
  type: REFRESH_TOKEN_FAILURE,
});
