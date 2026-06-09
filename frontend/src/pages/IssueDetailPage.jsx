import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getById, remove, update, vote, unvote } from "../services/issues"
import { isLoggedIn, getUserId } from "../services/auth"

function IssueDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [issue, setIssue] = useState(null)
    const [error, setError] = useState("")

    const loggedIn = isLoggedIn()
    const currentUserId = getUserId()

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

    const handleToggleStatus = async () => {
        const newStatus = issue.status === "open" ? "closed" : "open"
        try {
            const updated = await update(id, { status: newStatus })
            setIssue({ ...issue, ...updated })
        } catch (err) {
            setError("Failed to update status")
        }
    }

    const handleVoteToggle = async () => {
        try {
            const data = issue.hasVoted ? await unvote(id) : await vote(id)
            setIssue({ ...issue, votes: data.votes, hasVoted: data.hasVoted })
        } catch (err) {
            setError("Failed to update vote")
        }
    }

    if (error) return <div className="container mt-4"><p className="text-danger">{error}</p></div>
    if (!issue) return <div className="container mt-4"><p>Loading...</p></div>

    const isOwner = currentUserId === issue.userId

    return (
        <div className="container mt-4" style={{ maxWidth: 720 }}>
            <Link to="/" className="text-decoration-none">← Back</Link>

            <div className="d-flex justify-content-between align-items-start mt-2">
                <h2 className="mb-0">{issue.title}</h2>
                <span
                    className={`badge ${
                        issue.status === "open" ? "bg-success" : "bg-secondary"
                    }`}
                >
                    {issue.status}
                </span>
            </div>

            <p className="text-muted mb-3">
                {issue.category} · {issue.votes} {issue.votes === 1 ? "vote" : "votes"} ·{" "}
                Created {new Date(issue.createdAt).toLocaleDateString()}
            </p>

            <p>{issue.description}</p>

            <div className="d-flex gap-2 mt-4">
                {loggedIn && (
                    <button
                        onClick={handleVoteToggle}
                        className={`btn ${issue.hasVoted ? "btn-outline-primary" : "btn-primary"}`}
                    >
                        {issue.hasVoted ? "Remove vote" : "Vote"}
                    </button>
                )}

                {isOwner && (
                    <>
                        <button
                            onClick={handleToggleStatus}
                            className="btn btn-outline-secondary"
                        >
                            {issue.status === "open" ? "Close issue" : "Reopen issue"}
                        </button>
                        <button onClick={handleDelete} className="btn btn-outline-danger">
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default IssueDetailPage
