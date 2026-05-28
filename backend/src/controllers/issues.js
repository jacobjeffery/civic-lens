const Issue = require("../models/issues")
// const issues = []


const getAllIssues = async (req, res) => {
    const { category, status } = req.query

    const where = {}
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

const deleteIssue = async (req,res) => {
    const id = parseInt(req.params.id)
    const deleted = await Issue.destroy({ where: { id } })
    
    if (deleted === 0) {
        return res.status(404).json({ error: "Issue not found"})
    }
    
    res.status(204).send()
}



const updateIssue = async (req, res) => {
    const id = parseInt(req.params.id)
    const issue = await Issue.findByPk(id)

    if (!issue) {
        return res.status(404).json({ error: "Issue not found" })
    }

    const { title, description, category, status } = req.body
    
    const updates  = {}
    if (title !== undefined) issue.title = title
    if (description !== undefined) issue.description = description
    if (category !== undefined) issue.category = category
    if (status !== undefined) issue.status = status

    await issue.update(updates)
    res.json(issue)
}

const createIssue = async (req,res) => {
    const { title, description, category, status } = req.body
    
    if (!title || !description || !category) {
        return res.status(400).json({
            error: "title, description, category and status are required"
        })
    }

    const newIssue = await Issue.create({
        title,
        description,
        category,
    })

    res.status(201).json(newIssue)
}





module.exports = {
    getAllIssues,
    createIssue,
    getIssueById,
    updateIssue,
    deleteIssue
} 
