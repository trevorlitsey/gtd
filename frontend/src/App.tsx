import React, { useState, useEffect } from "react";
import { Plus, Search, Archive } from "lucide-react";
import TaskForm from "./components/TaskForm";
import TaskItem from "./components/TaskItem";

const NirvanaGTD = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeView, setActiveView] = useState("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    notes: "",
    project: "",
    dueDate: "",
    energy: "medium",
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleTasks = [
      {
        id: 1,
        title: "Review quarterly reports",
        notes: "Focus on Q4 performance metrics",
        project: "Work Review",
        status: "inbox",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Call dentist for appointment",
        notes: "Schedule regular checkup",
        project: "",
        status: "next",
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const sampleProjects = [
      {
        id: 1,
        name: "Work Review",
        description: "Annual performance review process",
      },
      {
        id: 2,
        name: "Home Renovation",
        description: "Kitchen remodel project",
      },
    ];

    setTasks(sampleTasks);
    setProjects(sampleProjects);
  }, []);

  const addTask = (formData: any) => {
    if (!formData.title.trim()) return;
    const task = {
      id: Date.now(),
      ...formData,
      status: "inbox",
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, task]);
    setShowAddTask(false);
  };

  const updateTask = (id: number, updates: any) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completeTask = (id: number) => {
    updateTask(id, { completed: true, completedAt: new Date().toISOString() });
  };

  const moveTaskToStatus = (id: number, status: string) => {
    updateTask(id, { status });
  };

  const filteredTasks = tasks.filter((task) => {
    if (searchTerm) {
      return (
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (activeView) {
      case "inbox":
        return task.status === "inbox" && !task.completed;
      case "next":
        return task.status === "next" && !task.completed;
      case "waiting":
        return task.status === "waiting" && !task.completed;
      case "scheduled":
        return task.status === "scheduled" && !task.completed;
      case "someday":
        return task.status === "someday" && !task.completed;
      case "completed":
        return task.completed;
      default:
        return !task.completed;
    }
  });

  const sidebarItems = [
    {
      id: "inbox",
      label: "Inbox",
      count: tasks.filter((t) => t.status === "inbox" && !t.completed).length,
    },
    {
      id: "next",
      label: "Next Actions",
      count: tasks.filter((t) => t.status === "next" && !t.completed).length,
    },
    {
      id: "waiting",
      label: "Waiting For",
      count: tasks.filter((t) => t.status === "waiting" && !t.completed).length,
    },
    {
      id: "someday",
      label: "Someday/Maybe",
      count: tasks.filter((t) => t.status === "someday" && !t.completed).length,
    },
    {
      id: "completed",
      label: "Completed",
      count: tasks.filter((t) => t.completed).length,
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
          </div>
        </nav>
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
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>
        </div>
        {/* Task List */}
        <div className="flex-1 overflow-auto p-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No tasks match your search"
                  : `No tasks in ${activeView}`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                  onEdit={setEditingTask}
                  onDelete={deleteTask}
                  onMove={moveTaskToStatus}
                />
              ))}
            </div>
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
          task={editingTask}
          onSave={(updatedTask: any) => {
            updateTask(editingTask.id, updatedTask);
            setEditingTask(null);
          }}
          onCancel={() => setEditingTask(null)}
          projects={projects}
        />
      )}
    </div>
  );
};

export default NirvanaGTD;
