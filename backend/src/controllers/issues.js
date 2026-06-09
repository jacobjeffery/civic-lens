const Issue = require("../models/issues")
const CATEGORIES = require("../constants/categories")

const getCategories = (req, res) => {
    res.json(CATEGORIES)
}

const getAllIssues = async (req, res) => {
    const { category, status } = req.query

    const where = {}
    if (category) where.category = category
    if (status) where.status = status

    const issues = await Issue.findAll({ where })
    res.json(issues)
}

const getMyIssues = async (req, res) => {
    const { category, status } = req.query
    const where = { userId: req.user.id }
    if (category) where.category = category
    if (status) where.status = status

    const issues = await Issue.findAll({ where })
    res.json(issues)
}

const getIssueById = async (req, res) => {
    const id = parseInt(req.params.id)
    const issue = await Issue.findByPk(id)

    if (!issue) {
        return res.status(404).json({ error: "Issue not found" })
    }

    res.json(issue)
}

const deleteIssue = async (req, res) => {
    const id = parseInt(req.params.id)
    const issue = await Issue.findByPk(id)

    if (!issue) {
        return res.status(404).json({ error: "Issue not found" })
    }

    if (issue.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" })
    }

    await issue.destroy()
    res.status(204).send()
}



const updateIssue = async (req, res) => {
    const id = parseInt(req.params.id)
    const issue = await Issue.findByPk(id)

    if (!issue) {
        return res.status(404).json({ error: "Issue not found" })
    }

    if (issue.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden"})
    }

    const { title, description, category, status } = req.body
    
    const updates  = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (status !== undefined) updates.status = status

    await issue.update(updates)
    res.json(issue)
}

const createIssue = async (req,res) => {
    const { title, description, category } = req.body
    
    if (!title || !description || !category) {
        return res.status(400).json({
            error: "title, description and category are required"
        })
    }

    if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category" })
    }

    const newIssue = await Issue.create({
        title,
        description,
        category,
        userId: req.user.id
    })

    res.status(201).json(newIssue)
}





module.exports = {
    getAllIssues,
    getMyIssues,
    createIssue,
    getIssueById,
    updateIssue,
    deleteIssue,
    getCategories
} 
