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
        <nav className="navbar navbar-expand bg-light px-3">
            <Link to="/" className="navbar-brand">CivicLens</Link>
            <div className="navbar-nav">
                <Link to="/" className="nav-link">Issues</Link>
                {loggedIn && <Link to="/issues/new" className="nav-link">New Issue</Link>}
                {loggedIn ? (
                    <button onClick={handleLogout} className="btn btn-link nav-link">Logout</button>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
            </div>
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
