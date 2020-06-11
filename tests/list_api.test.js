const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let i = 0; i < helper.initialBlogs.length; i++) {
    let blogOjbect = new Blog(helper.initialBlogs[i])
    await blogOjbect.save()
  }
})

test('Test08a: blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('Test08b: number of blogs', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('Test08c: the first blog is about React patterns', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].title).toBe('React patterns')
})

test('Test08d: a specific blog title is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')
  const titles = response.body.map(r => r.title)

  expect(titles).toContain(
    'First class tests'
  )
})

test('Test09: unique identifier', async () => {
  const response = await api.get('/api/blogs')
  const ids = response.body.map(r => r.id)
  // console.log('ids', ids)
  // console.log('ids[0]', ids[0])
  // console.log('typeof ids', typeof ids)
  // console.log('typeof ids[0]', typeof ids[0])
  expect(ids[0]).toBeDefined()
})

test('Test10a: add a new blog good correct data', async () => {
  const newBlog = {
    title: 'Test 2',
    author: 'Steve Job',
    url: 'https://test.com/steve',
    likes: 9
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const titles = response.body.map(r => r.title)

  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(titles).toContain(
    'Test 2'
  )
})

test('Test10b: add a new blog with an undefined props', async () => {
  let newBlog

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('Test11: add a new blog with missing likes property', async () => {
  const newBlog = {
    title: 'Blog with missing likes property',
    author: 'Viet Phan',
    url: 'https://test.com/no-likes'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const listBlogs = response.body
  const theBlog = listBlogs.filter(blog => blog.url === newBlog.url)[0]
  // console.log(theBlog)
  expect(theBlog.likes).toBeDefined()
  expect(theBlog.likes).toBe(0)
  //expect the likes to be defined and value === 0
})

test('Test12a: add a new blog with missing title', async () => {
  const newBlog = {
    url: 'https://test.com/no-title',
    author: 'Viet Phan',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('Test12b: add a new blog with missing url', async () => {
  const newBlog = {
    title: 'Blog without url',
    author: 'Viet Phan',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

// test('Test12c: add a new blog with missing author', async () => {
//   const newBlog = {
//     title: 'Blog with a missing author',
//     url: 'https://test.com/no-author',
//     likes: 0
//   }

//   await api
//     .post('/api/blogs')
//     .send(newBlog)
//     .expect(400)

//   const response = await api.get('/api/blogs')
//   expect(response.body).toHaveLength(helper.initialBlogs.length)
// })

test('TestExtra1: add a new blog too short url', async () => {
  const newBlog = {
    title: 'Blog without invalid url',
    author: 'Viet Phan',
    url: 'www.com',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('TestExtra2: add a new blog too short title', async () => {
  const newBlog = {
    title: 'B',
    author: 'Viet Phan',
    url: 'www.blog-with-invalid-length',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('TestExtra3: add a new blog with a existing url', async () => {
  const newBlog = {
    title: 'Same link but different tittle',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

afterAll(() => {
  mongoose.connection.close()
})