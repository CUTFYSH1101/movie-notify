// export const API_BASE = 'http://127.0.0.1:5000'
export const API_BASE = 'https://changelico.pythonanywhere.com'
export const API = {
  movies: `${API_BASE}/api/movies`,
  theaters: `${API_BASE}/api/theaters`,
  showings: `${API_BASE}/api/showings`,
  movie_versions: `${API_BASE}/api/movie_versions`,
  versions: `${API_BASE}/api/versions`,
  dates: `${API_BASE}/api/dates`,
  facet: `${API_BASE}/api/facet`,
  movie_showtimes: (movie_id: string) => `${API_BASE}/api/movies/${movie_id}/showtimes`,
  theater_showtimes: (theater_id: string) => `${API_BASE}/api/theaters/${theater_id}/showtimes`,
  movie: (movie_id: string) => `${API_BASE}/api/movies/${movie_id}`,
  theater: (theater_id: string) => `${API_BASE}/api/theaters/${theater_id}`,
  city_movie_counts: `${API_BASE}/api/cities/movie_counts`,
  city_theater_ids: `${API_BASE}/api/cities/theaters`,
  city_versions: `${API_BASE}/api/cities/versions`,
} as const  // as const 增加提示
