const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")

const { getAllIssues, 
        getMyIssues, 
        createIssue, 
        getIssueById, 
        updateIssue, deleteIssue, 
        getCategories 
    } = require("../controllers/issues")

router.get("/categories", getCategories)
router.get("/", getAllIssues)
router.get("/mine", authMiddleware, getMyIssues)
router.get("/:id", getIssueById)
router.post("/", authMiddleware, createIssue)
router.put("/:id", authMiddleware, updateIssue)
router.delete("/:id", authMiddleware, deleteIssue)


module.exports = router
