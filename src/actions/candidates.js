export const FETCH_CANDIDATES_REQUEST = "FETCH_CANDIDATES_REQUEST";
export const FETCH_CANDIDATES_SUCCESS = "FETCH_CANDIDATES_SUCCESS";
export const FETCH_CANDIDATES_FAILURE = "FETCH_CANDIDATES_FAILURE";

// Action to trigger API call
export const fetchCandidatesRequest = () => ({
  type: FETCH_CANDIDATES_REQUEST,
});

// Action to store fetched candidates in Redux
export const fetchCandidatesSuccess = (candidates) => ({
  type: FETCH_CANDIDATES_SUCCESS,
  payload: candidates,
});

// Action for handling errors
export const fetchCandidatesFailure = (error) => ({
  type: FETCH_CANDIDATES_FAILURE,
  payload: error,
});
