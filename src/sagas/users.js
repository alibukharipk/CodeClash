import { call, put, takeLatest } from "redux-saga/effects";
import {
  FETCH_USERS_REQUEST,
  fetchUsersSuccess,
  fetchUsersFailure,
} from "../actions/users";
import axios from "axios";
import { Auth_URL } from "../common.js";

function fetchUsersAPI() {
  return axios.get(`${Auth_URL}/users/`);
}

function* fetchUsers() {
  try {
    const response = yield call(fetchUsersAPI);
    yield put(fetchUsersSuccess(response.data));
  } catch (error) {
    yield put(fetchUsersFailure(error.message));
  }
}

// Watcher Saga
export function* watchUsers() {
  yield takeLatest(FETCH_USERS_REQUEST, fetchUsers);
}