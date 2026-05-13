const issues = []

const getAllIssues = (req, res) => {
    res.json(issues)
}

const createIssue = (req,res) => {
    const { title, description, category, status } = req.body

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
    createIssue
} 
