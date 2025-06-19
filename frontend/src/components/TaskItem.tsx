import React from "react";
import { Edit3, Check, Trash2 } from "lucide-react";

interface TaskItemProps {
  task: any;
  onComplete: (id: number) => void;
  onEdit: (task: any) => void;
  onDelete: (id: number) => void;
  onMove: (id: number, status: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onEdit,
  onDelete,
  onMove,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          {task.notes && (
            <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {task.project && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {task.project}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => onComplete(task.id)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Complete task"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <select
          value={task.status}
          onChange={(e) => onMove(task.id, e.target.value)}
          className="text-sm px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="inbox">Inbox</option>
          <option value="next">Next Actions</option>
          <option value="waiting">Waiting For</option>
          <option value="someday">Someday/Maybe</option>
        </select>
      </div>
    </div>
  );
};

export default TaskItem;
