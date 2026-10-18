export const API_PORT = 5000
export const API = {
  movies: '/api/movies',
  theaters: '/api/theaters',
  showings: '/api/showings',
  movie_versions: '/api/movie_versions',
  versions: '/api/versions',
  dates: '/api/dates',
  facet: '/api/facet',
} as const  // as const 增加提示