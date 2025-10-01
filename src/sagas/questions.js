import { call, put, takeLatest } from "redux-saga/effects";
import { FETCH_QUESTIONS_REQUEST, fetchQuestionsSuccess, fetchQuestionsFailure } from "../actions/questions";
import api from "../services/api";
import { API_URL } from "../common.js";

function fetchQuestionsAPI() {
  return api.get(`${API_URL}/questions/`);
}

function* fetchQuestions() {
  try {
    const response = yield call(fetchQuestionsAPI);
    yield put(fetchQuestionsSuccess(response.data));
  } catch (error) {
    yield put(fetchQuestionsFailure(error.message));
  }
}

export function* watchQuestions() {
  yield takeLatest(FETCH_QUESTIONS_REQUEST, fetchQuestions);
}