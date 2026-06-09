const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const optionalAuth = require("../middleware/optionalAuth")

const {
    getAllIssues,
    getMyIssues,
    createIssue,
    getIssueById,
    updateIssue,
    deleteIssue,
    getCategories,
    voteIssue,
    unvoteIssue
} = require("../controllers/issues")

router.get("/categories", getCategories)
router.get("/", getAllIssues)
router.get("/mine", authMiddleware, getMyIssues)
router.get("/:id", optionalAuth, getIssueById)
router.post("/", authMiddleware, createIssue)
router.put("/:id", authMiddleware, updateIssue)
router.delete("/:id", authMiddleware, deleteIssue)
router.post("/:id/vote", authMiddleware, voteIssue)
router.delete("/:id/vote", authMiddleware, unvoteIssue)

module.exports = router
