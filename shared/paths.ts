export const API_PORT = 5000
export const API = {
  movies: '/api/movies',
  theaters: '/api/theaters',
  showings: '/api/showings',
  join_showings: '/api/join_showings',
  versions: '/api/versions',
  dates: '/api/dates',
} as const  // as const 增加提示