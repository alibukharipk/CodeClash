import { call, put, takeLatest } from "redux-saga/effects";
import { FETCH_ROLES_REQUEST, fetchRolesSuccess, fetchRolesFailure } from "../actions/roles";
import api from "../services/api";
import { API_URL } from "../common.js";

function fetchRolesAPI() {
      return api.get(`${API_URL}/roles/`);

}

function* fetchRoles() {
  try {
    const response = yield call(fetchRolesAPI);
    yield put(fetchRolesSuccess(response.data));
  } catch (error) {
    yield put(fetchRolesFailure(error.message));
  }
}

export function* watchRoles() {
  yield takeLatest(FETCH_ROLES_REQUEST, fetchRoles);
}