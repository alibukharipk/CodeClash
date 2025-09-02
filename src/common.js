export const API_URL = window.location.origin + "/api";
export const Auth_URL = window.location.origin + "/auth";

export const formatDuration = (minutes) => {
const hrs = Math.floor(minutes / 60);
const mins = minutes % 60;

if (hrs > 0 && mins > 0) return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} mins`;
if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
return `${mins} mins`;
};

export const questionTypeLabels = {
  mcq_single: "Single Choice",
  mcq_multiple: "Multiple Choice",
  coding: "Coding",
};