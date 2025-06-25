import { all } from "redux-saga/effects";
import { watchSkills } from "../sagas/skills";
import { watchCandidates } from "../sagas/candidates";
import { watchRoles } from "../sagas/roles";
import { watchQuestions } from "../sagas/questions";
import { watchAuth } from "../sagas/auth";
import { watchUsers } from "../sagas/users";

export default function* rootSaga() {
  yield all([watchSkills(), watchCandidates(), watchRoles(), watchQuestions(), watchAuth(), watchUsers()]);

}