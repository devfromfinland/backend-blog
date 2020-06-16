/**
 * @intructions
 * Run the whole test: npm test
 * Run individual test: npm test -- -t TESTCODE
 * Check @README for a list of TESTCODE
 */
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')
const Blog = require('../models/blog')
const helper = require('./test_helper')

// return: { token, username, name } and decoded token: { username, id }
const doLogin = async (username, password = null) => {
  const credentials = {
    username: username,
    password: password
      ? password
      : '12345678' // this password goes with initial users ('root' and 'viet')
  }

  const res = await api
    .post('/api/login')
    .send(credentials)
    .expect(200)

  return res.body
}

// return: { id, username, name, blogs }
const getUser = async (username) => {
  const response = await api
    .get(`/api/users/${username}`)

  return response.body[0]
}

// init same database before each test for consistency
// init 2 users ('root' and 'viet') to database, default password: '12345678'
// init 6 blogs to database, and assign user 'viet' as the owner of all 6 blogs
// user 'viet' is the owner of 6 blogs
beforeEach(async () => {
  // init 2 users ('root' and 'viet') to database, default password: '12345678'
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('12345678', 10)
  const user = new User({ username: 'root', passwordHash, name: 'Admin' })
  await user.save()
  const passwordHash2 = await bcrypt.hash('12345678', 10)
  const user2 = new User({ username: 'viet', passwordHash: passwordHash2, name: 'Viet Phan' })
  let savedUser2 = await user2.save()
  // console.log('first id', savedUser2.id)

  // init 6 blogs to database, and assign user 'viet' as the owner of all 6 blogs
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs
    .map(blog => new Blog({ ...blog, user: savedUser2._id }))
  const promiseBlogsArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseBlogsArray)  // this can't guarantee the order of database

  // assign all 6 blogs to user 'viet' and update
  const blogIds = (await helper.blogsInDb()).map(blog => blog.id)
  savedUser2.blogs = blogIds
  await savedUser2.save()
  // console.log('after update id', savedUser3.id)
})

describe('Saving and getting initial blogs to database', () => {
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

  // test('Test08c: the first blog is about React patterns', async () => {
  //   const response = await api.get('/api/blogs')
  //   const titles = response.body.map(blog => blog.title)
  //   console.log(titles)
  //   expect(titles[0]).toBe('React patterns')
  // })

  test('Test08d: a specific blog title is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain('First class tests')
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
  test('Test10a: add a new blog with proper data fields and authorization', async () => {
    const login = await doLogin('root')
    // console.log('login', login)

    const newBlog = {
      title: 'Test 2',
      author: 'Steve Job',
      url: 'https://test.com/steve',
      likes: 9
    }

    const res = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const savedBlog = res.body
    const user = await getUser(login.username)
    // console.log('savedBlog', savedBlog)
    // console.log('root user', user)
    expect(savedBlog.user).toEqual(user.id)
    expect(user.blogs).toContain(savedBlog.id)

    const blogs = await helper.blogsInDb()
    const titles = blogs.map(blog => blog.title)
    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain('Test 2')
  })

  test('Test10b: add a new blog without authorization', async () => {
    const newBlog = {
      title: 'Test 2',
      author: 'Steve Job',
      url: 'https://test.com/steve',
      likes: 9
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('Test10c: add a new blog with an undefined props', async () => {
    const login = await doLogin('root')
    let newBlog

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('Test11: add a new blog with missing likes property', async () => {
    const login = await doLogin('root')

    const newBlog = {
      title: 'Blog with missing likes property',
      author: 'Viet Phan',
      url: 'https://test.com/no-likes'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.token}`)
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
    const login = await doLogin('root')

    const newBlog = {
      url: 'https://test.com/no-title',
      author: 'Viet Phan',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('Test12b: add a new blog with missing url', async () => {
    const login = await doLogin('root')
    const newBlog = {
      title: 'Blog without url',
      author: 'Viet Phan',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('TestExtra1: add a new blog too short url', async () => {
    const login = await doLogin('root')
    const newBlog = {
      title: 'Blog without invalid url',
      author: 'Viet Phan',
      url: 'www.com',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('TestExtra2: add a new blog too short title', async () => {
    const login = await doLogin('root')
    const newBlog = {
      title: 'B',
      author: 'Viet Phan',
      url: 'www.blog-with-invalid-length',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('TestExtra3: add a new blog with a existing url', async () => {
    const login = await doLogin('root')
    const newBlog = {
      title: 'Same link but different tittle',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${login.token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe('Viewing a specific blog', () => {
  test('View a normal blog', async () => {
    const blogsData = await helper.blogsInDb()
    // console.log('blogs Data', blogsData)

    const firstBlog = blogsData[0]
    // console.log('first blog', firstBlog)

    const result = await api
      .get(`/api/blogs/${firstBlog.id}`)
      .expect(200)  // OK
      .expect('Content-Type', /application\/json/)

    const theBlog = { ...result.body, user: result.body.user.id }
    // console.log('body', result.body)
    // console.log('theBlog', theBlog)
    // console.log(typeof theBlog.user, typeof firstBlog.user)

    expect(JSON.stringify(theBlog)).toEqual(JSON.stringify(firstBlog))
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
  test('Delete a normal blog with wrong authorization', async () => {
    const login = await doLogin('root')

    const blogsDataBefore = await helper.blogsInDb()
    const firstBlog = blogsDataBefore[0]
    await api
      .delete(`/api/blogs/${firstBlog.id}`)
      .set('Authorization', `bearer ${login.token}`)
      .expect(401)  // No Content

    const blogsDataCurrent = await helper.blogsInDb()
    // console.log('blogsData 1', blogsDataCurrent)
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length)
  })

  test('Delete a normal blog with correct authorization', async () => {
    const login = await doLogin('viet')

    const blogsDataBefore = await helper.blogsInDb()
    const firstBlog = blogsDataBefore[0]
    await api
      .delete(`/api/blogs/${firstBlog.id}`)
      .set('Authorization', `bearer ${login.token}`)
      .expect(204)  // No Content

    const blogsDataCurrent = await helper.blogsInDb()
    // console.log('blogsData 1', blogsDataCurrent)
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length - 1)
  })

  test('Delete a blog which has a wrong id', async () => {
    const login = await doLogin('viet')
    const wrongId = '123'
    await api
      .delete(`/api/blogs/${wrongId}`)
      .set('Authorization', `bearer ${login.token}`)
      .expect(400)  // Bad Request

    const blogsData = await helper.blogsInDb()
    // console.log('blogsData 2', blogsData)
    expect(blogsData.length).toBe(helper.initialBlogs.length)
  })
})

describe('Updating a blog', () => {
  test('Update blog with valid data and authorization', async () => {
    const login = await doLogin('viet')
    const blogsDataBefore = await helper.blogsInDb()
    const firstBlog = blogsDataBefore[0]
    // console.log('before', blogsDataBefore[0])
    const updateData = {
      likes: firstBlog.likes + 1,
      title: 'updated title'
    }

    await api
      .put(`/api/blogs/${firstBlog.id}`)
      .set('Authorization', `bearer ${login.token}`)
      .send(updateData)
      .expect(200)

    const blogsDataCurrent = await helper.blogsInDb()
    // console.log('after', blogsDataCurrent[0])
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length)
    expect(blogsDataCurrent[0].likes).toBe(firstBlog.likes + 1)
    expect(blogsDataCurrent[0].title).toEqual('updated title')
  })

  test('Update blog with valid data withou authorization', async () => {
    const login = await doLogin('root')
    const blogsDataBefore = await helper.blogsInDb()
    const firstBlog = blogsDataBefore[0]
    // console.log('before', blogsDataBefore[0])
    const updateData = {
      likes: firstBlog.likes + 1,
      title: 'updated title'
    }

    await api
      .put(`/api/blogs/${firstBlog.id}`)
      .set('Authorization', `bearer ${login.token}`)
      .send(updateData)
      .expect(401)

    const blogsDataCurrent = await helper.blogsInDb()
    // console.log('after', blogsDataCurrent[0])
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length)
    expect(blogsDataCurrent[0].likes).toBe(firstBlog.likes)
    expect(blogsDataCurrent[0].title).toEqual(firstBlog.title)
  })

  test('Update blog with invalid data', async () => {
    const login = await doLogin('viet')
    const blogsDataBefore = await helper.blogsInDb()
    const firstBlog = blogsDataBefore[0]

    const updateData = {
      likes: firstBlog.likes + 1,
      title: 'a', // too short title
      author: ''  // empty author
    }

    await api
      .put(`/api/blogs/${firstBlog.id}`)
      .set('Authorization', `bearer ${login.token}`)
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
    const login = await doLogin('viet')
    const invalidId = 'abc123'
    const updateData = {
      likes: 1,
      title: 'This data should not be added',
      author: 'This data should not be added'
    }

    await api
      .put(`/api/blogs/${invalidId}`)
      .set('Authorization', `bearer ${login.token}`)
      .send(updateData)
      .expect(400)  // bad request

    const blogsDataCurrent = await helper.blogsInDb()
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length)
  })

  test('Update blog with valid id but already removed', async () => {
    const login = await doLogin('viet')
    const nonExistingId = helper.nonExistingId()
    const updateData = {
      likes: 1,
      title: 'This data should not be added to database',
      author: 'This data should not be added to database'
    }

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .set('Authorization', `bearer ${login.token}`)
      .send(updateData)
      .expect(400)

    const blogsDataCurrent = await helper.blogsInDb()
    expect(blogsDataCurrent.length).toBe(helper.initialBlogs.length)
  })
})

describe('Saving to and getting initial users from database', () => {
  test('Test15a: users are returned as json', async (done) => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    done()  // fix bug "Jest has detected he following 1 open handle potentially keeping Jest from exiting"
  })

  test('Test15b: there are two initial users and one of the usernames is `viet`', async () => {
    const users = await helper.usersInDb()
    // console.log('users', users)
    expect(users.length).toBe(2)
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
      .expect('Content-Type', /application\/json/)

    const usersAfter = await helper.usersInDb()
    const usernames = usersAfter.map(user => user.username)
    expect(usersAfter.length).toBe(usersBefore.length + 1)
    expect(usernames).toContain(newUser.username)
  })

  test('Test16a: Create new user with duplicated username', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'viet',
      name: 'New User',
      password: '12345678'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })

  test('Test16b: Create new user with too short username', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'vi',
      name: 'New User',
      password: '12345678'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('is shorter than the minimum allowed length')

    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })

  test('Test16c: Create new user with too short password', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'newUser',
      name: 'New User',
      password: '12'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('is shorter than the minimum allowed length')

    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })

  test('Test16d: Create new user with missing password field', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'newUser',
      name: 'New User',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('content missing')
    console.log('error', result.body.error)

    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })

  test('Test18a: Login with correct username and password', async (done) => {
    // expect code 200
    const loginInfo = {
      username: 'viet',
      password: '12345678'
    }

    await api
      .post('/api/login')
      .send(loginInfo)
      .expect(200)

    done()
  })

  test('Test18b: Login with correct username but wrong pwd', async (done) => {
    // expect 401 Unauthorized
    const loginInfo = {
      username: 'viet',
      password: '12345'
    }

    await api
      .post('/api/login')
      .send(loginInfo)
      .expect(401)

    done()
  })

  test('Test18c: Login with incorrect username', async (done) => {
    // expect 401 Unauthorized
    const loginInfo = {
      username: 'something',
      password: '12345678'
    }

    await api
      .post('/api/login')
      .send(loginInfo)
      .expect(401)

    done()
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})