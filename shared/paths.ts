export const API_BASE = 'https://changelico.pythonanywhere.com'
export const API = {
  movies: `${API_BASE}/api/movies`,
  theaters: `${API_BASE}/api/theaters`,
  showings: `${API_BASE}/api/showings`,
  movie_versions: `${API_BASE}/api/movie_versions`,
  versions: `${API_BASE}/api/versions`,
  dates: `${API_BASE}/api/dates`,
  facet: `${API_BASE}/api/facet`,
} as const  // as const 增加提示
