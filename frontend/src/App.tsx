import React, { useState, useEffect } from "react";
import { Plus, Search, Archive, Folder } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import TaskForm from "./components/TaskForm";
import SortableTaskItem from "./components/SortableTaskItem";
import Projects from "./components/Projects";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import { authService, taskService, projectService } from "./services/api";

const NirvanaGTD = ({ onLogout }: { onLogout: () => void }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeView, setActiveView] = useState("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task._id === active.id);
      const newIndex = tasks.findIndex((task) => task._id === over?.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);

      // Persist the new order to the backend
      try {
        const taskIds = newTasks.map((task) => task._id);
        await taskService.reorderTasks(taskIds);
      } catch (err) {
        console.error("Error updating task order:", err);
        // Optionally revert the order if the API call fails
        // setTasks(tasks);
      }
    }
  };

  // Load all tasks and projects from backend
  useEffect(() => {
    loadAllData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        setShowAddTask(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setShowAddTask(false);
        setEditingTask(null);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, projectsData] = await Promise.all([
        taskService.getTasks(),
        projectService.getProjects(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err) {
      setError("Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (formData: any) => {
    if (!formData.title.trim()) return;

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        project: formData.project || undefined,
        status: activeView as
          | "inbox"
          | "next"
          | "waiting"
          | "scheduled"
          | "someday"
          | "done",
      };

      const newTask = await taskService.createTask(taskData);
      setTasks([...tasks, newTask]);
      setShowAddTask(false);
    } catch (err) {
      setError("Failed to create task");
      console.error("Error creating task:", err);
    }
  };

  const updateTask = async (id: string, updates: any) => {
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
    } catch (err) {
      setError("Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      setError("Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  const completeTask = async (id: string) => {
    await updateTask(id, { status: "done" });
  };

  const moveTaskToStatus = async (id: string, status: string) => {
    await updateTask(id, { status });
  };

  // Filter tasks for current view and search
  const filteredTasks = tasks.filter((task) => {
    // First filter by current view
    if (activeView === "done") {
      if (task.status !== "done") return false;
    } else {
      if (task.status !== activeView) return false;
    }

    // Then filter by search term
    if (searchTerm) {
      return (
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return true;
  });

  // Group tasks by project
  const groupedTasks = filteredTasks.reduce(
    (groups: { [key: string]: any[] }, task: any) => {
      const projectName = task.project?.name || "No Project";
      if (!groups[projectName]) {
        groups[projectName] = [];
      }
      groups[projectName].push(task);
      return groups;
    },
    {}
  );

  // Sort project names (No Project first, then alphabetically)
  const sortedProjectNames = Object.keys(groupedTasks).sort((a, b) => {
    if (a === "No Project") return -1;
    if (b === "No Project") return 1;
    return a.localeCompare(b);
  });

  const sidebarItems = [
    {
      id: "inbox",
      label: "Inbox",
      count: tasks.filter((t) => t.status === "inbox").length,
    },
    {
      id: "next",
      label: "Next Actions",
      count: tasks.filter((t) => t.status === "next").length,
    },
    {
      id: "waiting",
      label: "Waiting For",
      count: tasks.filter((t) => t.status === "waiting").length,
    },
    {
      id: "someday",
      label: "Someday/Maybe",
      count: tasks.filter((t) => t.status === "someday").length,
    },
    {
      id: "done",
      label: "Completed",
      count: tasks.filter((t) => t.status === "done").length,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">Nirvana GTD</h1>
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                  activeView === item.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            {/* Projects Navigation */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => navigate("/projects")}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                  location.pathname === "/projects"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>Projects</span>
              </button>
            </div>
          </div>
        </nav>
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {activeView === "next"
                ? "Next Actions"
                : activeView === "waiting"
                ? "Waiting For"
                : activeView === "someday"
                ? "Someday/Maybe"
                : activeView}
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button
                onClick={() => setShowAddTask(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                title="Add new task (N)"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>
        </div>
        {/* Task List */}
        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No tasks match your search"
                  : `No tasks in ${activeView}`}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {sortedProjectNames.map((projectName) => (
                <div key={projectName} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {projectName}
                  </h3>
                  <SortableContext
                    items={groupedTasks[projectName].map((task) => task._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {groupedTasks[projectName].map((task) => (
                        <SortableTaskItem
                          key={task._id}
                          task={task}
                          onComplete={completeTask}
                          onEdit={setEditingTask}
                          onDelete={deleteTask}
                          onMove={moveTaskToStatus}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </DndContext>
          )}
        </div>
      </div>
      {/* Add Task Modal */}
      {showAddTask && (
        <TaskForm
          onSave={addTask}
          onCancel={() => setShowAddTask(false)}
          projects={projects}
        />
      )}
      {/* Edit Task Modal */}
      {editingTask && (
        <TaskForm
          task={{
            ...editingTask,
            description: editingTask.description || editingTask.notes,
          }}
          onSave={(updatedTask: any) => {
            const taskData = {
              title: updatedTask.title,
              description: updatedTask.description,
              project: updatedTask.project || undefined,
            };
            updateTask(editingTask._id, taskData);
            setEditingTask(null);
          }}
          onCancel={() => setEditingTask(null)}
          projects={projects}
        />
      )}
    </div>
  );
};

const useAuth = () => {
  const [user, setUser] = useState<any>(authService.getCurrentUser());

  useEffect(() => {
    setUser(authService.getCurrentUser());

    // Listen for automatic logout events from API interceptor
    const handleAuthLogout = (event: CustomEvent) => {
      setUser(null);
      // The event detail contains the reason (unauthorized/forbidden)
      console.log(`Auto-logout due to: ${event.detail.reason}`);
    };

    window.addEventListener("auth:logout", handleAuthLogout as EventListener);

    return () => {
      window.removeEventListener(
        "auth:logout",
        handleAuthLogout as EventListener
      );
    };
  }, []);

  return { user, setUser };
};

const App: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoginError(null);
      const user = await authService.login(email, password);
      setUser(user);
      navigate("/");
    } catch (err) {
      setLoginError("Login failed. Please check your credentials.");
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const user = await authService.register(name, email, password);
      setUser(user);
      navigate("/");
    } catch (err) {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLogin={handleLogin} error={loginError} />}
      />
      <Route
        path="/register"
        element={<Register onRegister={handleRegister} />}
      />
      <Route
        path="/projects"
        element={
          user ? (
            <Projects onLogout={handleLogout} />
          ) : (
            <Login onLogin={handleLogin} error={loginError} />
          )
        }
      />
      <Route
        path="/*"
        element={
          user ? (
            <NirvanaGTD onLogout={handleLogout} />
          ) : (
            <Login onLogin={handleLogin} error={loginError} />
          )
        }
      />
    </Routes>
  );
};

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
