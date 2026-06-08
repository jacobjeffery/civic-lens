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
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input 
                    id="email"
                    type="text"
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
                    onChange={(e)=> setPassword(e.target.value)}
                    />
                </div>

                {error && <p style={{color: "red" }}>{error}</p>}

                <button type="submit">Log in</button>
            </form>
        </div>
    )
}

export default LoginPage