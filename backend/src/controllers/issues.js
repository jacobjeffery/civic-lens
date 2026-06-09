const Issue = require("../models/issues")
const Vote = require("../models/votes")
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

    const response = issue.toJSON()

    if (req.user) {
        const myVote = await Vote.findOne({
            where: { userId: req.user.id, issueId: id }
        })
        response.hasVoted = !!myVote
    } else {
        response.hasVoted = false
    }

    res.json(response)
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

const voteIssue = async (req, res) => {
    const id = parseInt(req.params.id)
    const issue = await Issue.findByPk(id)

    if (!issue) {
        return res.status(404).json({ error: "Issue not found" })
    }

    try {
        await Vote.create({ userId: req.user.id, issueId: id })
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ error: "Already voted" })
        }
        throw err
    }

    await issue.increment("votes")
    await issue.reload()

    res.json({ votes: issue.votes, hasVoted: true })
}

const unvoteIssue = async (req, res) => {
    const id = parseInt(req.params.id)
    const issue = await Issue.findByPk(id)

    if (!issue) {
        return res.status(404).json({ error: "Issue not found" })
    }

    const myVote = await Vote.findOne({
        where: { userId: req.user.id, issueId: id }
    })

    if (!myVote) {
        return res.status(404).json({ error: "No vote to remove" })
    }

    await myVote.destroy()
    await issue.decrement("votes")
    await issue.reload()

    res.json({ votes: issue.votes, hasVoted: false })
}

module.exports = {
    getAllIssues,
    getMyIssues,
    createIssue,
    getIssueById,
    updateIssue,
    deleteIssue,
    getCategories,
    voteIssue,
    unvoteIssue
}
