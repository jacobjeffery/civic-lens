const issues = []

const getAllIssues = (req, res) => {
    const { category, status } = req.query
    let result = issues 
    if (category) result = result.filter(i => i.category === category)
    if (status) result = result.filter(i => i.status === status)
    res.json(result)
}

const getIssueById = (req, res) => {
    const id = parseInt(req.params.id)
    const issue = issues.find(i => i.id === id)

    if (!issue) {
        return res.status(404).json({ error: "Issue not found" })
    }

    res.json(issue)
}

const deleteIssue = (req,res) => {
    const id = parseInt(req.params.id)
    const index = issues.findIndex(i => i.id === id)

    if (index === -1) {
        return res.status(404).json({ error: "Issue not found" })
    }

    issues.splice(index, 1)
    res.status(204).send()
}


const updateIssue = (req, res) => {
    const id = parseInt(req.params.id)
    const issue = issues.find(i => i.id === id)

    if (!issue) {
        return res.status(404).json({ error: "Issue not found" })
    }

    const { title, description, category, status } = req.body
    
    if (title !== undefined) issue.title = title
    if (description !== undefined) issue.description = description
    if (category !== undefined) issue.category = category
    if (status !== undefined) issue.status = status

    res.json(issue)
}

const createIssue = (req,res) => {
    const { title, description, category, status } = req.body
    
    if (!title || !description || !category || !status) {
        return res.status(400).json({
            error: "title, description, category and status are required"
        })
    }

    const newIssue = {
        id: issues.length + 1,
        title,
        description,
        category,
        status,
        createdAt: new Date()
    }



    issues.push(newIssue)
    res.status(201).json(newIssue)
}





module.exports = {
    getAllIssues,
    createIssue,
    getIssueById,
    updateIssue,
    deleteIssue
} 
