const express = require("express")
const router = express.Router()

const { getAllIssues } = require("../controllers/issues")

router.get("/", getAllIssues)

module.exports = router
