export const FETCH_QUESTIONS_REQUEST = "FETCH_QUESTIONS_REQUEST";
export const FETCH_QUESTIONS_SUCCESS = "FETCH_QUESTIONS_SUCCESS";
export const FETCH_QUESTIONS_FAILURE = "FETCH_QUESTIONS_FAILURE";

export const fetchQuestionsRequest = () => ({
  type: FETCH_QUESTIONS_REQUEST,
});

export const fetchQuestionsSuccess = (questions) => ({
  type: FETCH_QUESTIONS_SUCCESS,
  payload: questions,
});

export const fetchQuestionsFailure = (error) => ({
  type: FETCH_QUESTIONS_FAILURE,
  payload: error,
});