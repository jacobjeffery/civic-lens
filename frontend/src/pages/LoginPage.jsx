import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../services/auth"

function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(email, password)
            navigate("/")
        } catch (err) {
            setError("Invalid email or password")
        }
    }

    return (
        <div className="container mt-4" style={{ maxWidth: 400 }}>
            <h2>Login</h2>

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

                <button type="submit" className="btn btn-primary">Log in</button>
            </form>
        </div>
    )
}

export default LoginPage
