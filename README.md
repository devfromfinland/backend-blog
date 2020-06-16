# BLOG SERVER (back-end)
This is the back-end of a Blog app. Features include:
- Receive blog requests from front-end, handle requests, and respond with suitable code and contents
- Handle user authentication and make sure only authorized owner of a blog can modify that blog. Allow to create new users
- Keep data in a server database (MongoDB)

## To config:
Add these 4 suitable environment varibales in your case 

1. ``MONGODB_URI`` database link, something like this `mongodb+srv://[username]:[password]@cluster0-jcavg.mongodb.net/bloglist?retryWrites=true`
2. ``MONGODB_URI_TEST`` similar database but for testing purpose
3. ``PORT`` port for running server locally
4. ``SECRET`` any string to add into the authentication

## To start:
``npm install`` install dependencies

``npm start`` run in Production mode

## To run in development mode
``npm run dev`` run in Development mode (with `nodemon`)

## To run test for development purpose (jest environment)
``npm test`` run the whole test
``npm test -- -t TESTCODE`` run individual test based on TESTCODE (which are bold below)
sample requests are placed under the `requests` folder

## TESTS DONE
### Saving and getting initial blogs to database
- [x] **Test08a**: blogs are returned as json (2408 ms)
- [x] **Test08b**: number of blogs (1222 ms)
- [x] **Test08d**: a specific blog title is within the returned blogs (1239 ms)
- [x] **Test09**: unique identifier is id instead of _id (1248 ms)
### Adding a new blog
- [x] **Test10a**: add a new blog with proper data fields and authorization (1756 ms)
- [x] **Test10b**: add a new blog without authorization (1268 ms)
- [x] **Test10c**: add a new blog with an undefined props (1526 ms)
- [x] **Test11**: add a new blog with missing likes property (1700 ms)
- [x] **Test12a**: add a new blog with missing title (1527 ms)
- [x] **Test12b**: add a new blog with missing url (1434 ms)
- [x] **TestExtra1**: add a new blog too short url (1435 ms)
- [x] **TestExtra2**: add a new blog too short title (1405 ms)
- [x] **TestExtra3**: add a new blog with a existing url (1453 ms)
### Viewing a specific blog
- [x] **Test08e**: View a normal blog (1165 ms)
- [x] **Test08f**: View a blog which was already deleted (1361 ms)
- [x] **Test08g**: View with an invalid id (1018 ms)
### Delete a specific blog
- [x] **Test21a**: Delete a normal blog with wrong authorization (1456 ms)
- [x] **Test21b**: Delete a normal blog with correct authorization (1413 ms)
- [x] **Test21c**: Delete a blog which has a wrong id (1303 ms)
### Updating a blog
- [x] **TestExtra4**: Update blog with valid data and authorization (1626 ms)
- [x] **TestExtra5**: Update blog with valid data withou authorization (1511 ms)
- [x] **TestExtra6**: Update blog with invalid data (1630 ms)
- [x] **TestExtra7**: Update blog with invalid id (1292 ms)
- [x] **TestExtra8**: Update blog with valid id but already removed (1317 ms)
### Saving to and getting initial users from database
- [x] **Test15a**: users are returned as json (1200 ms)
- [x] **Test15b**: there are two initial users and one of the usernames is `viet` (1142 ms)
- [x] **Test15d**: Create new user with valid data (1407 ms)
- [x] **Test16a**: Create new user with duplicated username (1231 ms)
- [x] **Test16b**: Create new user with too short username (1277 ms)
- [x] **Test16c**: Create new user with too short password (1151 ms)
- [x] **Test16d**: Create new user with missing password field (1109 ms)
- [x] **Test18a**: Login with correct username and password (1213 ms)
- [x] **Test18b**: Login with correct username but wrong pwd (1236 ms)
- [x] **Test18c**: Login with incorrect username (1096 ms)
