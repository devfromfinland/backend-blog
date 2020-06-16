# BLOG SERVER (back-end)
This is the back-end of a Blog app. Features include:
- Receive blog requests from front-end, handle requests, and respond with suitable code and contents
- Handle user authentication and make sure only authorized owner of a blog can modify that blog. Allow to create new users
- Keep data in a server database (MongoDB)

## To config:
Add these 4 suitable environment varibales in your case 
``MONGODB_URI`` database link, something like this `mongodb+srv://[username]:[password]@cluster0-jcavg.mongodb.net/bloglist?retryWrites=true`
``MONGODB_URI_TEST`` similar database but for testing purpose
``PORT`` port for running server locally
``SECRET`` any string to add into the authentication

## To start:
``npm install`` install dependencies
``npm start`` run in Production mode
``npm run dev`` run in Development mode (with `nodemon`)

## To run test for development purpose (jest environment)
``npm test`` run the whole test
``npm test -- -t TESTCODE`` run individual test based on TESTCODE (which are bold below)
sample requests are placed under the `requests` folder

## TESTS DONE
### Saving and getting initial blogs to database
  √ **Test08a**: blogs are returned as json (2408 ms)
  √ **Test08b**: number of blogs (1222 ms)
  <!-- (dropped) **Test08c**: the first blog is about React patterns (1166 ms) -->
  √ **Test08d**: a specific blog title is within the returned blogs (1239 ms)
  √ **Test09**: unique identifier is id instead of _id (1248 ms)
### Adding a new blog
  √ **Test10a**: add a new blog with proper data fields and authorization (1756 ms)
  √ **Test10b**: add a new blog without authorization (1268 ms)
  √ **Test10c**: add a new blog with an undefined props (1526 ms)
  √ **Test11**: add a new blog with missing likes property (1700 ms)
  √ **Test12a**: add a new blog with missing title (1527 ms)
  √ **Test12b**: add a new blog with missing url (1434 ms)
  √ **TestExtra1**: add a new blog too short url (1435 ms)
  √ **TestExtra2**: add a new blog too short title (1405 ms)
  √ **TestExtra3**: add a new blog with a existing url (1453 ms)
### Viewing a specific blog
  √ **Test08e**: View a normal blog (1165 ms)
  √ **Test08f**: View a blog which was already deleted (1361 ms)
  √ **Test08g**: View with an invalid id (1018 ms)
### Delete a specific blog
  √ **Test21a**: Delete a normal blog with wrong authorization (1456 ms)
  √ **Test21b**: Delete a normal blog with correct authorization (1413 ms)
  √ **Test21c**: Delete a blog which has a wrong id (1303 ms)
### Updating a blog
  √ **TestExtra4**: Update blog with valid data and authorization (1626 ms)
  √ **TestExtra5**: Update blog with valid data withou authorization (1511 ms)
  √ **TestExtra6**: Update blog with invalid data (1630 ms)
  √ **TestExtra7**: Update blog with invalid id (1292 ms)
  √ **TestExtra8**: Update blog with valid id but already removed (1317 ms)
### Saving to and getting initial users from database
  √ **Test15a**: users are returned as json (1200 ms)
  √ **Test15b**: there are two initial users and one of the usernames is `viet` (1142 ms)
  √ **Test15d**: Create new user with valid data (1407 ms)
  √ **Test16a**: Create new user with duplicated username (1231 ms)
  √ **Test16b**: Create new user with too short username (1277 ms)
  √ **Test16c**: Create new user with too short password (1151 ms)
  √ **Test16d**: Create new user with missing password field (1109 ms)
  √ **Test18a**: Login with correct username and password (1213 ms)
  √ **Test18b**: Login with correct username but wrong pwd (1236 ms)
  √ **Test18c**: Login with incorrect username (1096 ms)
