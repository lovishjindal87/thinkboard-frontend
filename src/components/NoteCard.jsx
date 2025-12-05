import React from 'react';
import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

const NoteCard = ({note, setNotes}) => {

  const getPriorityConfig = (priority) => {
    const normalized = priority || "medium";

    const map = {
      low: {
        label: "Low",
        borderClass: "border-success",
        badgeClass: "badge-success badge-outline",
      },
      medium: {
        label: "Medium",
        borderClass: "border-warning",
        badgeClass: "badge-warning badge-outline",
      },
      high: {
        label: "High",
        borderClass: "border-error",
        badgeClass: "badge-error",
      },
    };

    return map[normalized] || map.medium;
  };

  const priorityConfig = getPriorityConfig(note.priority);

  const getStatusLabel = (status) => {
    const normalized = status || "todo";
    if (normalized === "in-progress") return "In Progress";
    if (normalized === "done") return "Done";
    return "To Do";
  };

  const handleStatusChange = async (e) => {
    // prevent navigation from the Link wrapping this card
    e.preventDefault();
    e.stopPropagation();

    const newStatus = e.target.value;
    const previousStatus = note.status || "todo";

    // optimistic UI update
    setNotes((prev) =>
      prev.map((n) =>
        n._id === note._id ? { ...n, status: newStatus } : n
      )
    );

    try {
      await api.put(`/notes/${note._id}`, {
        title: note.title,
        content: note.content,
        priority: note.priority,
        status: newStatus,
        dueDate: note.dueDate,
      });
      toast.success(`Status updated to "${getStatusLabel(newStatus)}"`);
    } catch (error) {
      console.log("Error updating status", error);
      toast.error("Failed to update status");

      // revert optimistic update on error
      setNotes((prev) =>
        prev.map((n) =>
          n._id === note._id ? { ...n, status: previousStatus } : n
        )
      );
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault(); // get rid of the navigation behaviour

    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id)); // get rid of the deleted one
      toast.success("Note deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete note");
    }
  };

  return (
    <Link
      to={`/note/${note._id}`}
      className={`card bg-base-100 hover:shadow-lg transition-all duration-200 border-t-4 border-solid ${priorityConfig.borderClass}`}
    >
      <div className="card-body">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="card-title text-base-content">{note.title}</h3>
          <span className={`badge badge-sm self-start ${priorityConfig.badgeClass}`}>
            {priorityConfig.label} priority
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-base-content/60">Status</span>
          <select
            className="select select-xs select-bordered"
            value={note.status || "todo"}
            onChange={handleStatusChange}
            onClick={(e) => {
              // also prevent navigation when opening the dropdown
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <option value="in-progress">In Progress</option>
            <option value="todo">To Do</option>
            <option value="done">Done</option>
          </select>
        </div>
        <p className="text-base-content/70 line-clamp-3">{note.content}</p>
        <div className="card-actions justify-between items-center mt-4">
          <span className="text-sm text-base-content/60">
            {formatDate(new Date(note.createdAt))}
          </span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4" aria-hidden="true" />
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => handleDelete(e, note._id)}
              aria-label="Delete note"
            >
              <Trash2Icon className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default NoteCard;