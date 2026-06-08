import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import IssueListPage from "./pages/IssueListPage"
import IssueDetailPage from "./pages/IssueDetailPage"
import CreateIssuePage from "./pages/CreateIssuePage"
import ProtectedRoute from "./components/ProtectedRoute"
import { isLoggedIn, logout } from "./services/auth"

function Nav() {
    const navigate = useNavigate()
    const loggedIn = isLoggedIn()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <nav>
            <Link to="/">Issues</Link>
            {loggedIn && <> | <Link to="/issues/new">New Issue</Link></>}
            {loggedIn ? (
                <> | <button onClick={handleLogout}>Logout</button></>
            ) : (
                <>
                    {" | "}<Link to="/login">Login</Link>
                    {" | "}<Link to="/register">Register</Link>
                </>
            )}
        </nav>
    )
}

function App() {
    return (
        <BrowserRouter>
            <Nav />

            <Routes>
                <Route path="/" element={<IssueListPage />} />
                <Route
                    path="/issues/new"
                    element={
                        <ProtectedRoute>
                            <CreateIssuePage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/issues/:id" element={<IssueDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
