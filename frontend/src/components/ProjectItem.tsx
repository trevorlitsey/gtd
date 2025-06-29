import React, { useState } from "react";
import { Edit, Trash2, MoreVertical } from "lucide-react";

interface ProjectItemProps {
  project: any;
  taskCount: number;
  onEdit: (project: any) => void;
  onDelete: (id: string) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  taskCount,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${project.name}"? This will also remove all tasks associated with this project.`
      )
    ) {
      onDelete(project._id);
    }
    setShowMenu(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {project.name}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>
                {taskCount} task{taskCount !== 1 ? "s" : ""}
              </span>
              <span>
                Created {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Project options"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit(project);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectItem;
