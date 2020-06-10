// const http = require('http')
require('dotenv').config()
const express = require('express')
const cors = require('cors')
// const Blog = require('./models/blog')
const blogsRouter = require('./controllers/blogs')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsRouter)



const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})