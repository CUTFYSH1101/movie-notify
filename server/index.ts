import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const db = new DatabaseSync(fileURLToPath(new URL('../src/assets/movies.db', import.meta.url)), {
    readOnly: true,
})

const PORT = 3000

createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/movies') {
        const movies = db.prepare('SELECT * FROM movies').all()
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify(movies))
    } else {
        res.writeHead(404).end()
    }
}).listen(PORT, () => {
    console.log(`API server: http://localhost:${PORT}`)
})