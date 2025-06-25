import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import skillsReducer from "../reducers/skills";
import candidatesReducer from "../reducers/candidates";
import rolesReducer from "../reducers/roles";
import questionsReducer from "../reducers/questions";
import rootSaga from "../sagas/rootSaga";
import authReducer from "../reducers/auth";
import usersReducer from "../reducers/users";
import { routerMiddleware, connectRouter } from "connected-react-router";
import { createBrowserHistory } from "history";

export const history = createBrowserHistory();

const sagaMiddleware = createSagaMiddleware();

// ✅ Use `compose` to combine enhancers
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  skills: skillsReducer,
  candidates: candidatesReducer,
  roles: rolesReducer,
  questions: questionsReducer,
  auth: authReducer,
  users: usersReducer,
  router: connectRouter(history),
});

// ✅ Combine middleware using `composeEnhancers`
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware, routerMiddleware(history)))
);

sagaMiddleware.run(rootSaga);

export default store;