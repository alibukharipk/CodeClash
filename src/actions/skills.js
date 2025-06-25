export const FETCH_SKILLS_REQUEST = "FETCH_SKILLS_REQUEST";
export const FETCH_SKILLS_SUCCESS = "FETCH_SKILLS_SUCCESS";
export const FETCH_SKILLS_FAILURE = "FETCH_SKILLS_FAILURE";

export const fetchSkillsRequest = () => ({
  type: FETCH_SKILLS_REQUEST,
});

export const fetchSkillsSuccess = (skills) => ({
  type: FETCH_SKILLS_SUCCESS,
  payload: skills,
});

export const fetchSkillsFailure = (error) => ({
  type: FETCH_SKILLS_FAILURE,
  payload: error,
});