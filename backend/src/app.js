const express = require("express")
const cors = require("cors")
const app = express()
const issueRoutes = require("./routes/issues")
const authRoutes = require("./routes/auth")

app.use(express.json())
app.use(cors())
app.use("/issues", issueRoutes)
app.use("/auth", authRoutes)

module.exports = app