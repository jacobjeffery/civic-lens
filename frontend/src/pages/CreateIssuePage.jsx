import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { create } from "../services/issues"
import { getAll as getCategories } from "../services/categories"

function CreateIssuePage() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [error, setError] = useState("")
    const [categories, setCategories] = useState([])

    useEffect(() => {
        getCategories().then(setCategories)
    }, [])
    
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const newIssue = await create({ title, description, category })
            navigate(`/issues/${newIssue.id}`)
        } catch (err) {
            setError("Failed to create issue. Make sure you're logged in.")
        }
    }

    return (
        <div className="container mt-4" style={{ maxWidth: 720 }}>
            <h2 className="mb-3">New Issue</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        id="title"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        id="description"
                        className="form-control"
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                        id="category"
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {error && <p className="text-danger">{error}</p>}

                <button type="submit" className="btn btn-primary">Create</button>
            </form>
        </div>
    )
}

export default CreateIssuePage
