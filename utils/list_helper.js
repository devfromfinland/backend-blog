const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.length === 0
    ? 0
    : blogs.reduce((sum, item) => { return sum + item.likes }, 0)
}

const favoriteBlog = (blogs) => {
  let favoriteOne = null
  let max = 0

  for (let i = 0; i < blogs.length; i++) {
    if (blogs[i].likes > max) {
      max = blogs[i].likes
      favoriteOne = blogs[i]
    }
  }

  return blogs.length === 0
    ? null
    : {
      title: favoriteOne.title,
      author: favoriteOne.author,
      likes: favoriteOne.likes
    }
}

const isExistAuthor = (author, list) => {
  for (let i = 0; i < list.length; i++) {
    if (list[i].author === author) {
      return i
    }
  }
  return -1
}

const mostBlogs = (blogs) => {
  let listAuthors = []  // { author: String, blogs: Number }
  let maxCount = 0
  let maxIndex = blogs.length === 1 ? 0 : -1

  for (let i = 0; i < blogs.length; i++) {
    const author = blogs[i].author
    const findIndex = isExistAuthor(author, listAuthors)
    // console.log('findIndex', findIndex)
    if (findIndex === -1) {
      listAuthors.push({
        author,
        blogs: 1
      })
    } else {
      listAuthors[findIndex].blogs++
      if (listAuthors[findIndex].blogs > maxCount) {
        maxCount = listAuthors[findIndex].blogs
        maxIndex = findIndex
      }
    }
  }
  // console.log('maxCount', maxCount)
  // console.log('maxIndex', maxIndex)

  return blogs.length === 0
    ? null
    : {
      author: listAuthors[maxIndex].author, // author name
      blogs: listAuthors[maxIndex].blogs // count number of blogs
    }
}

const mostLikes = (blogs) => {
  const result = _.maxBy(blogs, 'likes')
  // console.log('returned blog', result)

  return blogs.length === 0
    ? null
    : {
      author: result.author,
      likes: result.likes
    }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}