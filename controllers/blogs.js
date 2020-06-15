const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const blog = await Blog.findById(id)
    .populate('user', { username: 1, name: 1 })
  // console.log('found blog', blog)
  blog === null
    ? response.status(404).end()
    : response.json(blog)
  // response.json(blog)
})

blogsRouter.post('/', async (request, response) => {
  const { user, title, author, url, likes } = request.body

  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  console.log('passed authentication')

  let updateUser = await User.findById(user)

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user,
  })

  console.log('blog to save', blog)

  const savedBlog = await blog.save()

  console.log('saved blog', savedBlog)
  updateUser.blogs = updateUser.blogs.concat(savedBlog._id)
  await updateUser.save()

  response.json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  await Blog.findByIdAndDelete(id)
  // console.log('delete result', result)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const { title, author, url, likes } = request.body

  let blog = await Blog.findById(id)

  title ? blog.title = title : null
  author ? blog.author = author : null
  url ? blog.url = url : null
  likes ? blog.likes = likes : null

  // send to server
  const updatedBlog = await blog.save()
  response.json(updatedBlog)
})

module.exports = blogsRouter