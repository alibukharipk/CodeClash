import { call, put, takeLatest } from "redux-saga/effects";
import { FETCH_SKILLS_REQUEST, fetchSkillsSuccess, fetchSkillsFailure } from "../actions/skills";
import axios from "axios";
import { API_URL } from "../common.js";

function fetchSkillsAPI() {
  return axios.get(`${API_URL}/skills/`);
}

function* fetchSkills() {
  try {
    const response = yield call(fetchSkillsAPI);
    yield put(fetchSkillsSuccess(response.data));
  } catch (error) {
    yield put(fetchSkillsFailure(error.message));
  }
}

export function* watchSkills() {
  yield takeLatest(FETCH_SKILLS_REQUEST, fetchSkills);
}