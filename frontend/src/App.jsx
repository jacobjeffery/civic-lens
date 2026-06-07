import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import IssueListPage from "./pages/IssueListPage"
import IssueDetailPage from "./pages/IssueDetailPage"
import CreateIssuePage from "./pages/CreateIssuePage"


function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Issues</Link> |
        <Link to="/login">Login</Link> |
        <Link to="/register">Register</Link> |
        <Link to="/issues/new"> New Issue</Link>
      </nav>

      <Routes>
        <Route path="/" element={<IssueListPage />} />
        <Route path="/issues/new" element={<CreateIssuePage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
