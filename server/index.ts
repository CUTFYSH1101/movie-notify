import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { API_PORT, API } from '../shared/paths.ts'

const db = new DatabaseSync(fileURLToPath(new URL('../src/assets/movies.db', import.meta.url)), {
    readOnly: true,
})

createServer((req, res) => {
    if (req.method === 'GET' && req.url === API.movies) {
        const movies = db.prepare('SELECT * FROM movies').all()
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify(movies))
    } else {
        res.writeHead(404).end()
    }
}).listen(API_PORT, () => {
    console.log(`API server: http://localhost:${API_PORT}`)
})