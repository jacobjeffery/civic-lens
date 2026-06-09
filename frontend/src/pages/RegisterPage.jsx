import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register } from "../services/auth"

function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await register(email, password)
            navigate("/login")
        } catch (err) {
            setError("Registration failed. The email may already be in use.")
        }
    }

    return (
        <div className="container mt-4" style={{ maxWidth: 400 }}>
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                    <input
                        id="email"
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="email">Email</label>
                </div>

                <div className="form-floating mb-3">
                    <input
                        id="password"
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="password">Password</label>
                </div>

                {error && <p className="text-danger">{error}</p>}

                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    )
}

export default RegisterPage
