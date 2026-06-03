const express = require("express")
const app = express()
const issueRoutes = require("./routes/issues")
const authRoutes = require("./routes/auth")

app.use(express.json())
app.use("/issues", issueRoutes)
app.use("/auth", authRoutes)

module.exports = app