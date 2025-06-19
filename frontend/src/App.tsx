import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Task, taskService } from "./services/api";
import "./App.css";

// Components
const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <h2 style={{ marginBottom: "2rem", color: "var(--primary-color)" }}>
        GTD App
      </h2>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>Welcome, {user?.name}</p>
        <button
          onClick={logout}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "0.5rem 0",
          }}
        >
          Logout
        </button>
      </div>
      <nav>
        <Link
          to="/"
          className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
        >
          <i className="fas fa-tasks"></i>
          Inbox
        </Link>
        <Link
          to="/next-actions"
          className={`nav-item ${
            location.pathname === "/next-actions" ? "active" : ""
          }`}
        >
          <i className="fas fa-forward"></i>
          Next Actions
        </Link>
        <Link
          to="/projects"
          className={`nav-item ${
            location.pathname === "/projects" ? "active" : ""
          }`}
        >
          <i className="fas fa-project-diagram"></i>
          Projects
        </Link>
        <Link
          to="/waiting-for"
          className={`nav-item ${
            location.pathname === "/waiting-for" ? "active" : ""
          }`}
        >
          <i className="fas fa-clock"></i>
          Waiting For
        </Link>
        <Link
          to="/someday"
          className={`nav-item ${
            location.pathname === "/someday" ? "active" : ""
          }`}
        >
          <i className="fas fa-calendar"></i>
          Someday/Maybe
        </Link>
      </nav>
    </div>
  );
};

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await taskService.updateTask(taskId, { completed });
      setTasks(
        tasks.map((task) =>
          task._id === taskId ? { ...task, completed } : task
        )
      );
    } catch (err) {
      setError("Failed to update task");
    }
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task._id} className="task-item">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={task.completed}
            onChange={() => handleTaskToggle(task._id, !task.completed)}
          />
          <div className="task-content">
            <div className="task-title">{task.title}</div>
            <div className="task-meta">
              {task.dueDate &&
                `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
              {task.priority && ` • Priority: ${task.priority}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const MainContent = () => {
  const { user } = useAuth();
  console.log(user);
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="main-content">
      <h1 style={{ marginBottom: "2rem" }}>Inbox</h1>
      <TaskList />
      <button className="add-task-button">
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      setError(null);
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "var(--background-color)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ marginBottom: "2rem", textAlign: "center" }}>Login</h2>
        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "1rem",
              padding: "0.5rem",
              background: "#fee2e2",
              borderRadius: "0.25rem",
            }}
          >
            {error}
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid var(--border-color)",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid var(--border-color)",
            }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "var(--primary-color)",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          Login
        </button>
        <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "var(--primary-color)", textDecoration: "none" }}
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(email, password, name);
    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "var(--background-color)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ marginBottom: "2rem", textAlign: "center" }}>Sign Up</h2>
        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "1rem",
              padding: "0.5rem",
              background: "#fee2e2",
              borderRadius: "0.25rem",
            }}
          >
            {error}
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid var(--border-color)",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid var(--border-color)",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid var(--border-color)",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid var(--border-color)",
            }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "var(--primary-color)",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          Sign Up
        </button>
        <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--primary-color)", textDecoration: "none" }}
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <div className="app-container">
                <Sidebar />
                <MainContent />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
