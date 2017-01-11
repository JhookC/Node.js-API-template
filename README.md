# Node.js-API-template
Node.js RESTFUL API template using jsonwebtokens, mongoose, winston and express.

This template is a basic API developed in node.js and express that includes authentication with jsonwebtokens, daily logging with winston in external files and non relational database mongodb.

##Endpoints

####No TOKEN required: 
 - **[GET]**    *localhost:5000/api*                - Welcome message
 - **[POST]**   *localhost:5000/api/devToken*       - Token generator for testing
 - **[POST]**   *localhost:5000/api/register*       - Sign up user with password encrypted
 - **[POST]**   *localhost:5000/api/authenticate*   - Sign in with an user that already exists on the db
 
####TOKEN required:
 - **[GET]**    *localhost:5000/api/user*           - Get all users on db
 - **[GET]**    *localhost:5000/api/user/:_id*      - Get user with a specific id
 - **[POST]**   *localhost:5000/api/user*           - Create a new user with out password encrypted
 - **[PUT]**    *localhost:5000/api/user/:_id*      - Update user with a specific id
 - **[DELETE]** *localhost:5000/api/user/:_id*      - Delete user with a specific id

##Installation

At cmd/terminal go to the project folder and type the command `npm install`
