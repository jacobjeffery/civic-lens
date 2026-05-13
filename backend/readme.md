# Starting a server
- within your project folder:
- use `npm init` or `npm init -y` to create a project
- dependency step
	- `npm i express`
	- `npm i nodemon --save-dev`
- `package.json` file updates:
	- create the following scripts:
		- `"start": "node app.js"`
		- `"dev": "nodemon"
	- ensure your "main" file is the one you created
- to start our server, run `npm run dev`

# Express Basic `app.js` Structure

```js
const express = require("express")
const app = express()

const PORT = 4000
const HOST = "127.0.0.1"

app.listen(PORT, HOST, () => {
	console.log(`[sever] listening on ${HOST}:${PORT}`)
})
```

# Files & Meanings

- `/node_modules` folder
	- responsible for keeping the code of all dependencies
- `package.json` file
	- keeps track of all required dependencies
	- has our project information
	- has the entry point
	- has any scripts we want to run

# HTTP Protocol & RESTful architecture

The client can communicate with the server using the HTTP protocol. It is done using Representational State Transfer. In layman's terms, the client sends a request to an endpoint with a request for information. That endpoint has business logic to handle said request and return a response to us.

This is called the request/response lifecycle.

## Route / Endpoint

A route or endpoint is simply a spot after the socket where a request can be sent. Ex: https://google.com/, or https://apple.com/iphone/. Those are examples of routes or endpoints. The endpoints can also have query params attached to them. Ex: https://google.com/search?q=yourSearchTermHere

## HTTP Methods

HTTP methods allow us to define what we're doing with the data when we hit that specific endpoint. There are 9 standard methods, but we mostly need to know the four most common ones. They are:

- GET
- POST
- PUT
- DELETE

An endpoint can have multiple different methods. Ex: I can have /about endpoint that is a GET and a POST. They will serve different purposes.

## CRUD (Create, Read, Update, Delete)

At any given time, we perform a very simple process. We either want to read the data, add to it, update it, or delete it. These correspond to the following HTTP methods (loosely)

- Create : POST (or GET)
- Read : GET (or POST)
- Update : PUT or PATCH
- Delete : DELETE

## Anatomy of an HTTP Request / Response

- URL - defines the domain and endpoint of where we're going, including the HTTP method. Ex: GET https:/google.com/
- Headers - metadata. Contains data such as tokens, CORS info, type of incoming data, etc
- Body - exists on any request but used mostly on POST and PUT/PATCH. Can be anything: encoded, HTML, text, JSON, and so on.

Response specific:

- Status Code - health of our request/response (200, 201, 403, 404, 500)
- Headers 
- Payload - the goodies
