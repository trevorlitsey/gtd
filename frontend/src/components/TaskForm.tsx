import React, { useState } from "react";

interface TaskFormProps {
  task?: any;
  onSave: (formData: any) => void;
  onCancel: () => void;
  projects: { id: number; name: string }[];
}

const TaskForm: React.FC<TaskFormProps> = ({
  task = null,
  onSave,
  onCancel,
  projects,
}) => {
  const [formData, setFormData] = useState(
    task || {
      title: "",
      notes: "",
      project: "",
    }
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {task ? "Edit Task" : "Add New Task"}
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Task title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
          />

          <select
            value={formData.project}
            onChange={(e) =>
              setFormData({ ...formData, project: e.target.value })
            }
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.name}>
                {project.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                if (formData.title.trim()) onSave(formData);
              }}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              {task ? "Update" : "Add"} Task
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
