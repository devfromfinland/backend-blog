const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

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
})

blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  // console.log('token', request.token)
  // console.log('decoded token, id: ', decodedToken.id)

  let updateUser = await User.findById(decodedToken.id)

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: decodedToken.id,
  })
  // console.log('blog to save', blog)

  const savedBlog = await blog.save()
  // console.log('saved blog', savedBlog)
  updateUser.blogs = updateUser.blogs.concat(savedBlog._id)
  await updateUser.save()

  response.json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(id)

  if (blog) {
    // console.log('blog', blog)
    // console.log('logged in user', decodedToken.id)
    // console.log('typeof blog user', typeof blog.user)
    // console.log('typeof logged in user', typeof decodedToken.id)

    if (blog.user.toString() !== decodedToken.id) {
      return response.status(401).json({ error: 'token invalid, unauthorized action' })
    }

    await Blog.findByIdAndDelete(id)
    // console.log('delete result', result)
    response.status(204).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const { title, author, url, likes } = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  let blog = await Blog.findById(id)

  if (blog) {
    if (blog.user.toString() !== decodedToken.id) {
      return response.status(401).json({ error: 'token invalid, unauthorized action' })
    }

    title ? blog.title = title : null
    author ? blog.author = author : null
    url ? blog.url = url : null
    likes ? blog.likes = likes : null

    // send to server
    const updatedBlog = await blog.save()
    response.json(updatedBlog)
  }
})

module.exports = blogsRouter