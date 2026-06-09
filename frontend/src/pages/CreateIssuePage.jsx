import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { create } from "../services/issues"
import { getAll as getCategories } from "../services/issues"

function CreateIssuePage() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [error, setError] = useState("")
    const [categories, setCategories] = useState([])

    useEffect(() => {
        getCategories().then(setCategories)
    })
    
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
        <div>
            <h2>New Issue</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                    </select>
                </div>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit">Create</button>
            </form>
        </div>
    )
}

export default CreateIssuePage
