import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getById, remove } from "../services/issues"

function IssueDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [issue, setIssue] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const data = await getById(id)
                setIssue(data)
            } catch (err) {
                setError("Issue not found")
            }
        }
        fetchIssue()
    }, [id])

    const handleDelete = async () => {
        if (!confirm("Delete this issue?")) return
        try {
            await remove(id)
            navigate("/")
        } catch (err) {
            setError("Failed to delete")
        }
    }

    if (error) return <p style={{ color: "red" }}>{error}</p>
    if (!issue) return <p>Loading...</p>

    return (
        <div>
            <Link to="/">← Back</Link>
            <h2>{issue.title}</h2>
            <p><strong>Category:</strong> {issue.category}</p>
            <p><strong>Status:</strong> {issue.status}</p>
            <p><strong>Votes:</strong> {issue.votes}</p>
            <p>{issue.description}</p>
            <p style={{ color: "#888", fontSize: "0.85em" }}>
                Created {new Date(issue.createdAt).toLocaleString()}
            </p>

            <button onClick={handleDelete}>Delete</button>
        </div>
    )
}

export default IssueDetailPage
