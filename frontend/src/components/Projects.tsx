import React, { useState, useEffect } from "react";
import { Plus, Folder, Search, CheckSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import ProjectForm from "./ProjectForm";
import ProjectItem from "./ProjectItem";
import { projectService, taskService } from "../services/api";

interface ProjectsProps {
  onLogout: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ onLogout }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load all projects and tasks from backend
  useEffect(() => {
    loadData();
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
        setShowAddProject(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setShowAddProject(false);
        setEditingProject(null);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projectsData, tasksData] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks(),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (err) {
      setError("Failed to load projects");
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (formData: any) => {
    try {
      const newProject = await projectService.createProject(formData);
      setProjects([...projects, newProject]);
      setShowAddProject(false);
    } catch (err) {
      setError("Failed to create project");
      console.error("Error creating project:", err);
    }
  };

  const updateProject = async (id: string, updates: any) => {
    try {
      const updatedProject = await projectService.updateProject(id, updates);
      setProjects(
        projects.map((project) =>
          project._id === id ? updatedProject : project
        )
      );
    } catch (err) {
      setError("Failed to update project");
      console.error("Error updating project:", err);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter((project) => project._id !== id));
    } catch (err) {
      setError("Failed to delete project");
      console.error("Error deleting project:", err);
    }
  };

  // Get task count for each project
  const getTaskCount = (projectId: string) => {
    return tasks.filter((task) => task.project?._id === projectId).length;
  };

  // Filter projects by search term
  const filteredProjects = projects.filter((project) => {
    if (searchTerm) {
      return project.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">Nirvana GTD</h1>
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate("/")}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                location.pathname === "/"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </button>
            <button
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
            <div className="flex items-center gap-3">
              <Folder className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button
                onClick={() => setShowAddProject(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                title="Create new project (N)"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No projects match your search"
                  : "No projects yet. Create your first project to get started!"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddProject(true)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <ProjectItem
                  key={project._id}
                  project={project}
                  taskCount={getTaskCount(project._id)}
                  onEdit={setEditingProject}
                  onDelete={deleteProject}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProject && (
        <ProjectForm
          onSave={addProject}
          onCancel={() => setShowAddProject(false)}
        />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <ProjectForm
          project={editingProject}
          onSave={(updatedProject: any) => {
            const projectData = {
              name: updatedProject.name,
            };
            updateProject(editingProject._id, projectData);
            setEditingProject(null);
          }}
          onCancel={() => setEditingProject(null)}
        />
      )}
    </div>
  );
};

export default Projects;
