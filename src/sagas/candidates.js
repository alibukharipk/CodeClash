import { call, put, takeLatest } from "redux-saga/effects";
import {
  FETCH_CANDIDATES_REQUEST,
  fetchCandidatesSuccess,
  fetchCandidatesFailure,
} from "../actions/candidates";
import api from "../services/api";
import { API_URL } from "../common.js";

function fetchCandidatesAPI() {
  return api.get(`${API_URL}/candidates/`);
}

function* fetchCandidates() {
  try {
    const response = yield call(fetchCandidatesAPI);
    yield put(fetchCandidatesSuccess(response.data));
  } catch (error) {
    yield put(fetchCandidatesFailure(error.message));
  }
}

// Watcher Saga
export function* watchCandidates() {
  yield takeLatest(FETCH_CANDIDATES_REQUEST, fetchCandidates);
}