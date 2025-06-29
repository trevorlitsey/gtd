import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskItem from "./TaskItem";

interface SortableTaskItemProps {
  task: any;
  onComplete: (id: string) => void;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: string) => void;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  onComplete,
  onEdit,
  onDelete,
  onMove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        onMove={onMove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export default SortableTaskItem;
