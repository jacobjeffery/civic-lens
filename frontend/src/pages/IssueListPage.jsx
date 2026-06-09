import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAll, getMine } from "../services/issues"
import { getAll as getCategories } from "../services/categories"
import { isLoggedIn } from "../services/auth"

function IssueListPage() {
    const [issues, setIssues] = useState([])
    const [categories, setCategories] = useState([])
    const [category, setCategory] = useState("")
    const [status, setStatus] = useState("")
    const [mine, setMine] = useState(false)
    const [error, setError] = useState("")

    const loggedIn = isLoggedIn()

    useEffect(() => {
        getCategories().then(setCategories)
    }, [])

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const params = {}
                if (category) params.category = category
                if (status) params.status = status
                const data = mine ? await getMine(params) : await getAll(params)
                setIssues(data)
            } catch (err) {
                setError("Failed to load issues")
            }
        }
        fetchIssues()
    }, [category, status, mine])

    return (
        <div className="container mt-4">
            <h2 className="mb-3">Issues</h2>

            <div className="row g-2 mb-3 align-items-center">
                <div className="col-sm-4">
                    <select
                        id="category"
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="col-sm-4">
                    <select
                        id="status"
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">Any status</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {loggedIn && (
                    <div className="col-sm-4">
                        <div className="form-check form-switch">
                            <input
                                id="mine"
                                type="checkbox"
                                role="switch"
                                className="form-check-input"
                                checked={mine}
                                onChange={(e) => setMine(e.target.checked)}
                            />
                            <label htmlFor="mine" className="form-check-label">
                                Only mine
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-danger">{error}</p>}

            {issues.length === 0 ? (
                <p className="text-muted">No issues found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map((issue) => (
                                <tr key={issue.id}>
                                    <td>
                                        <Link to={`/issues/${issue.id}`}>
                                            {issue.title}
                                        </Link>
                                    </td>
                                    <td>{issue.category}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                issue.status === "open"
                                                    ? "bg-success"
                                                    : "bg-secondary"
                                            }`}
                                        >
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className="text-muted">
                                        {new Date(issue.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default IssueListPage
