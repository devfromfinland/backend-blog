const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')
const Blog = require('../models/blog')
const helper = require('./test_helper')

describe('Saving and getting initial blogs to database', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
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

  test('Test09: unique identifier is id instead of _id', async () => {
    const response = await api.get('/api/blogs')
    const ids = response.body.map(r => r.id)
    // console.log('ids', ids)
    // console.log('ids[0]', ids[0])
    // console.log('typeof ids', typeof ids)
    // console.log('typeof ids[0]', typeof ids[0])
    expect(ids[0]).toBeDefined()
  })
})

describe('Adding a new blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('Test10a: add a new blog with proper data fields', async () => {
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
})

describe('Viewing a specific blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('View a normal blog', async () => {
    const blogsData = await helper.blogsInDb()
    // console.log('blogs Data', blogsData)

    const firstBlog = blogsData[0]
    // console.log('first blog', firstBlog)

    const result = await api
      .get(`/api/blogs/${firstBlog.id}`)
      .expect(200)  // OK
      .expect('Content-Type', /application\/json/)

    // console.log('body', result.body)
    expect(result.body).toEqual(firstBlog)
  })

  test('View a blog which was already deleted', async () => {
    const validNonExistingId = await helper.nonExistingId()

    // console.log(validNonExistingId)

    await api
      .get(`/api/blogs/${validNonExistingId}`)
      .expect(404)
  })

  test('View with an invalid id', async () => {
    const invalidId = '123'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)  // Bad Request
  })
})

describe('Delete a specific blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('Delete a normal blog', async () => {
    const blogsDataBefore = await helper.blogsInDb()
    const firstBlog = blogsDataBefore[0]
    await api
      .delete(`/api/blogs/${firstBlog.id}`)
      .expect(204)  // No Content

    const blogsDataCurrent = await helper.blogsInDb()
    // console.log('blogsData 1', blogsDataCurrent)
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length - 1)
  })

  test('Delete a blog which has a wrong id', async () => {
    const wrongId = '123'
    await api
      .delete(`/api/blogs/${wrongId}`)
      .expect(400)  // Bad Request

    const blogsData = await helper.blogsInDb()
    // console.log('blogsData 2', blogsData)
    expect(blogsData.length).toBe(helper.initialBlogs.length)
  })
})

describe('Updating a blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('Update blog with valid data', async () => {
    const blogsDataBefore = await helper.blogsInDb()
    const firstBlog = blogsDataBefore[0]
    // console.log('before', blogsDataBefore[0])
    const updateData = {
      likes: firstBlog.likes + 1,
      title: 'updated title'
    }

    await api
      .put(`/api/blogs/${firstBlog.id}`)
      .send(updateData)
      .expect(200)

    const blogsDataCurrent = await helper.blogsInDb()
    // console.log('after', blogsDataCurrent[0])
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length)
    expect(blogsDataCurrent[0].likes).toBe(firstBlog.likes + 1)
    expect(blogsDataCurrent[0].title).toEqual('updated title')
  })

  test('Update blog with invalid data', async () => {
    const blogsDataBefore = await helper.blogsInDb()
    const firstBlog = blogsDataBefore[0]

    const updateData = {
      likes: firstBlog.likes + 1,
      title: 'a', // too short title
      author: ''  // empty author
    }

    await api
      .put(`/api/blogs/${firstBlog.id}`)
      .send(updateData)
      .expect(400)  // bad request

    const blogsDataCurrent = await helper.blogsInDb()

    // nothing change
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length)
    expect(blogsDataCurrent[0].likes).toBe(firstBlog.likes)
    expect(blogsDataCurrent[0].author).toBe(firstBlog.author)
    expect(blogsDataCurrent[0].title).toBe(firstBlog.title)
  })

  test('Update blog with invalid id', async () => {
    const invalidId = 'abc123'
    const updateData = {
      likes: 1,
      title: 'This data should not be added',
      author: 'This data should not be added'
    }

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(updateData)
      .expect(400)  // bad request

    const blogsDataCurrent = await helper.blogsInDb()
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length)
  })

  test('Update blog with valid id but already removed', async () => {
    const nonExistingId = helper.nonExistingId()
    const updateData = {
      likes: 1,
      title: 'This data should not be added to database',
      author: 'This data should not be added to database'
    }

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .send(updateData)
      .expect(400)

    const blogsDataCurrent = await helper.blogsInDb()
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length)
  })
})

describe('Saving to and getting initial users from database', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('12345678', 10)
    const user = new User({ username: 'root', passwordHash, name: 'Admin' })
    await user.save()

    const passwordHash2 = await bcrypt.hash('12345678', 10)
    const user2 = new User({ username: 'viet', passwordHash: passwordHash2, name: 'Viet Phan' })
    await user2.save()
  })

  test('Test15a: users are returned as json', async (done) => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    done()  // fix bug "Jest has detected he following 1 open handle potentially keeping Jest from exiting"
  })

  test('Test15b: there are two initial users', async () => {
    const users = await helper.usersInDb()
    // console.log('users', users)
    expect(users.length).toBe(2)
  })

  test('Test15c: User viet is existed', async () => {
    const users = await helper.usersInDb()
    const usernames = users.map(user => user.username)
    expect(usernames).toContain('viet')
  })

  test('Test15d: Create new user with valid data', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'newUser',
      name: 'New User',
      password: '12345678'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const usersAfter = await helper.usersInDb()
    const usernames = usersAfter.map(user => user.username)
    expect(usersAfter.length).toBe(usersBefore.length + 1)
    expect(usernames).toContain('newUser')
  })

  test('Test15e: Create new user with duplicated username', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'viet',
      name: 'New User',
      password: '12345678'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })

  test('Test15f: Create new user with too short username', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'vi',
      name: 'New User',
      password: '12345678'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })

  test('Test15g: Create new user with too short password', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'viet',
      name: 'New User',
      password: '12'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})