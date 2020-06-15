const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  // const body = request.body
  const { username, password, name } = request.body

  if (!username || !password) {
    return response.status(400).json({ error: 'content missing' })
  }

  if (password.length < 3) {
    return response.status(400).json({ error: 'password is shorter than the minimum allowed length' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name: name ? name : username,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

module.exports = usersRouter