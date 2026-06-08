import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAll } from "../services/issues"

function IssueListPage() {
    const [issues, setIssues] = useState([])
    const [category, setCategory] = useState("")
    const [status, setStatus] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const params = {}
                if (category) params.category = category
                if (status) params.status = status
                const data = await getAll(params)
                setIssues(data)
            } catch (err) {
                setError("Failed to load issues")
            }
        }
        fetchIssues()
    }, [category, status])

    return (
        <div>
            <h2>Issues</h2>

            <div>
                <label htmlFor="category">Category</label>
                <input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />

                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">Any</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {issues.length === 0 ? (
                <p>No issues found.</p>
            ) : (
                <ul>
                    {issues.map((issue) => (
                        <li key={issue.id}>
                            <Link to={`/issues/${issue.id}`}>
                                {issue.title}
                            </Link>
                            {" — "}
                            {issue.category} / {issue.status}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default IssueListPage
