import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import ProjectForm from "./ProjectForm";
import ProjectItem from "./ProjectItem";
import Sidebar from "./Sidebar";
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
      <Sidebar onLogout={onLogout} tasks={tasks} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
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
                title="Add new project (N)"
              >
                <Plus className="w-4 h-4" />
                Add Project
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
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📁</span>
              </div>
              <p className="text-gray-500">
                {searchTerm
                  ? "No projects match your search"
                  : "No projects yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => (
                <ProjectItem
                  key={project._id}
                  project={project}
                  taskCount={
                    tasks.filter((task) => task.project?._id === project._id)
                      .length
                  }
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
            updateProject(editingProject._id, updatedProject);
            setEditingProject(null);
          }}
          onCancel={() => setEditingProject(null)}
        />
      )}
    </div>
  );
};

export default Projects;
