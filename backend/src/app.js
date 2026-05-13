const express = require("express")
const app = express()
const issueRoutes = require("./routes/issues")

app.use(express.json())
app.use("/issues", issueRoutes)

module.exports = app