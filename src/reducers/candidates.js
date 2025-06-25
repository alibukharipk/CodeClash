import {
  FETCH_CANDIDATES_REQUEST,
  FETCH_CANDIDATES_SUCCESS,
  FETCH_CANDIDATES_FAILURE,
} from "../actions/candidates";

const initialState = {
  candidates: [],
  loading: false,
  error: null,
};

const candidatesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CANDIDATES_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_CANDIDATES_SUCCESS:
      return { ...state, loading: false, candidates: action.payload };

    case FETCH_CANDIDATES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default candidatesReducer;