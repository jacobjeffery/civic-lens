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
        <div>
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default RegisterPage
