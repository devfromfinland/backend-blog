const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const blog = await Blog.findById(id)
  // console.log('found blog', blog)
  blog === null
    ? response.status(404).end()
    : response.json(blog)
  // response.json(blog)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const result = await blog.save()
  response.json(result)
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