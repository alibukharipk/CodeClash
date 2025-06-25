export const API_URL = "https://codeclash.b-wyz.com/api";
export const Auth_URL = "https://codeclash.b-wyz.com/auth";

export const formatDuration = (minutes) => {
const hrs = Math.floor(minutes / 60);
const mins = minutes % 60;

if (hrs > 0 && mins > 0) return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} mins`;
if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
return `${mins} mins`;
};