import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import api from "../lib/axios";
import toast from "react-hot-toast";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";
import { useAuth } from "../context/AuthContext.jsx";

const HomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setNotes([]);
      return;
    }

    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        console.log(res.data);
        setNotes(res.data);
        setIsRateLimited(false);
      } catch (error) {
        console.log("Error fetching notes");
        console.log(error.response);
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load notes");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  const normalizeStatus = (status) => status || "todo";

  const priorityRank = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const sortByPriority = (a, b) => {
    const aRank = priorityRank[a.priority] ?? priorityRank.medium;
    const bRank = priorityRank[b.priority] ?? priorityRank.medium;

    if (aRank !== bRank) {
      return aRank - bRank; // high (0) first, then medium, then low
    }

    // fallback: newer first if same priority
    return new Date(b.createdAt) - new Date(a.createdAt);
  };

  const matchesSearch = (note) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const title = note.title?.toLowerCase() || "";
    const content = note.content?.toLowerCase() || "";
    return title.includes(q) || content.includes(q);
  };

  const matchesStatusFilter = (note) => {
    const normalized = normalizeStatus(note.status);
    if (statusFilter === "all") return true;
    if (statusFilter === "todo") return normalized === "todo";
    if (statusFilter === "in-progress") return normalized === "in-progress";
    if (statusFilter === "done") return normalized === "done";
    return true;
  };

  const filtered = notes.filter((note) => matchesSearch(note) && matchesStatusFilter(note));

  const inProgressNotes = filtered
    .filter((note) => normalizeStatus(note.status) === "in-progress")
    .sort(sortByPriority);

  const todoNotes = filtered
    .filter((note) => normalizeStatus(note.status) === "todo")
    .sort(sortByPriority);

  const doneNotes = filtered
    .filter((note) => normalizeStatus(note.status) === "done")
    .sort(sortByPriority);

  return (
    <div className="min-h-screen">
      <Navbar />

      {isRateLimited && <RateLimitedUI />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && <div className="text-center text-primary py-10">Loading notes...</div>}

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="form-control w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Search by title or description..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-control w-full md:w-auto">
            <div className="input-group">
              <span className="btn btn-ghost btn-sm no-animation">Status</span>
              <select
                className="select select-bordered select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="in-progress">In Progress</option>
                <option value="todo">To Do</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        </div>

        {!authLoading && !user && (
          <div className="max-w-2xl mx-auto mt-6 text-center">
            <h2 className="text-2xl font-semibold mb-2 text-base-content">
              Welcome to Thinkboard Tasks
            </h2>
            <p className="text-base-content/70">
              Please sign in with Google to manage your tasks.
            </p>
          </div>
        )}

        {!authLoading && !loading && user && notes.length === 0 && (
          <div className="mt-8">
            <NotesNotFound />
          </div>
        )}

        {!authLoading && !loading && notes.length > 0 && !isRateLimited && user && (
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="card bg-base-200/60 border border-base-content/10">
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-base-content uppercase tracking-wide">
                    In Progress
                  </h2>
                  <span className="badge badge-sm badge-outline">
                    {inProgressNotes.length} task{inProgressNotes.length === 1 ? "" : "s"}
                  </span>
                </div>
                {inProgressNotes.length === 0 ? (
                  <p className="text-sm text-base-content/50 italic">No tasks in progress.</p>
                ) : (
                  <div className="space-y-4">
                    {inProgressNotes.map((note) => (
                      <NoteCard key={note._id} note={note} setNotes={setNotes} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="card bg-base-200/60 border border-base-content/10">
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-base-content uppercase tracking-wide">
                    To Do
                  </h2>
                  <span className="badge badge-sm badge-outline">
                    {todoNotes.length} task{todoNotes.length === 1 ? "" : "s"}
                  </span>
                </div>
                {todoNotes.length === 0 ? (
                  <p className="text-sm text-base-content/50 italic">No tasks to do.</p>
                ) : (
                  <div className="space-y-4">
                    {todoNotes.map((note) => (
                      <NoteCard key={note._id} note={note} setNotes={setNotes} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="card bg-base-200/60 border border-base-content/10">
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-base-content uppercase tracking-wide">
                    Done
                  </h2>
                  <span className="badge badge-sm badge-outline">
                    {doneNotes.length} task{doneNotes.length === 1 ? "" : "s"}
                  </span>
                </div>
                {doneNotes.length === 0 ? (
                  <p className="text-sm text-base-content/50 italic">No tasks done yet.</p>
                ) : (
                  <div className="space-y-4">
                    {doneNotes.map((note) => (
                      <NoteCard key={note._id} note={note} setNotes={setNotes} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;