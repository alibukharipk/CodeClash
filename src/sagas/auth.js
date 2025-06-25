import { call, put, takeLatest } from "redux-saga/effects";
import { LOGIN_REQUEST, loginSuccess, loginFailure, LOGOUT, refreshTokenSuccess, refreshTokenFailure, REFRESH_TOKEN_REQUEST } from "../actions/auth";
import axios from "axios";
import { Auth_URL } from "../common.js";
import { push } from "connected-react-router";

function loginAPI(credentials) {
  return axios.post(`${Auth_URL}/login/`, credentials);
}

function refreshTokeAPI(refreshToken) {
    return axios.post(`${Auth_URL}/refresh-token/`, refreshToken);
  };

function* refreshTokenSaga() {
try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token found");

    const newTokens = yield call(refreshTokeAPI, refreshToken);
    yield put(refreshTokenSuccess(newTokens.access));
} catch (error) {
    yield put(refreshTokenFailure());
}
}  

function* login(action) {
  try {
    const response = yield call(loginAPI, action.payload);
    yield put(loginSuccess(response.data));
    yield put(push("/admin/dashboard")); 
  } catch (error) {
    yield put(loginFailure(error.message));
  }
}

function* logoutSaga()
{
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
}

export function* watchAuth() {
  yield takeLatest(LOGIN_REQUEST, login);
  yield takeLatest(REFRESH_TOKEN_REQUEST, refreshTokenSaga);
  yield takeLatest(LOGOUT, logoutSaga);
}