const express = require("express")
const router = express.Router()

const { getAllIssues, createIssue, getIssueById, updateIssue, deleteIssue } = require("../controllers/issues")

router.get("/", getAllIssues)
router.get("/:id", getIssueById)
router.post("/", createIssue)
router.put("/:id", updateIssue)
router.delete("/:id", deleteIssue)
module.exports = router

