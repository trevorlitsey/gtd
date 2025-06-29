import React, { useState } from "react";

interface ProjectFormProps {
  project?: any;
  onSave: (formData: any) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project = null,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState(
    project || {
      name: "",
    }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Handle escape key to close form
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [onCancel]);

  // Auto-focus on first input when form opens
  React.useEffect(() => {
    const nameInput = document.getElementById(
      "project-name"
    ) as HTMLInputElement;
    if (nameInput) {
      nameInput.focus();
    }
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {project ? "Edit Project" : "Create New Project"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="project-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project Name *
            </label>
            <input
              id="project-name"
              name="name"
              type="text"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              required
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-red-500 text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {project ? "Update" : "Create"} Project
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
