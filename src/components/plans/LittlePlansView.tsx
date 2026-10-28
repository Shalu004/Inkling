"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LittlePlanTask,
  LittlePlanSubtask,
} from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Clock,
  Tag,
  Search,
  Trash2,
  Edit2,
  ChevronRight,
  BookOpen,
  BookHeart,
  PenTool,
  AlertCircle,
  Filter,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ListTodo,
} from "lucide-react";

type PlanViewMode = "today" | "upcoming" | "completed" | "all";

export function LittlePlansView() {
  const [plans, setPlans] = useState<LittlePlanTask[]>([]);
  const [viewMode, setViewMode] = useState<PlanViewMode>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // New/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LittlePlanTask | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high">("medium");
  const [formSubtasks, setFormSubtasks] = useState<LittlePlanSubtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [formRecurring, setFormRecurring] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [formLinkedType, setFormLinkedType] = useState<"none" | "journal" | "reading" | "document">("none");
  const [formLinkedTitle, setFormLinkedTitle] = useState("");

  // Deletion confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [todayStr, setTodayStr] = useState<string>("");

  const loadPlans = () => {
    setPlans(hybridStore.getPlans());
  };

  useEffect(() => {
    loadPlans();
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  // Open modal for new task
  const handleOpenNewModal = () => {
    const curToday = todayStr || new Date().toISOString().split("T")[0];
    setEditingPlan(null);
    setFormTitle("");
    setFormNotes("");
    setFormDueDate(curToday);
    setFormPriority("medium");
    setFormSubtasks([]);
    setNewSubtaskText("");
    setFormRecurring("none");
    setFormLinkedType("none");
    setFormLinkedTitle("");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (task: LittlePlanTask) => {
    setEditingPlan(task);
    setFormTitle(task.title);
    setFormNotes(task.notes || "");
    setFormDueDate(task.dueDate || "");
    setFormPriority(task.priority);
    setFormSubtasks(task.subtasks || []);
    setNewSubtaskText("");
    setFormRecurring(task.recurring || "none");
    setFormLinkedType(task.linkedItem?.type || "none");
    setFormLinkedTitle(task.linkedItem?.title || "");
    setIsModalOpen(true);
  };

  // Save task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    hybridStore.savePlan({
      id: editingPlan?.id,
      title: formTitle.trim(),
      notes: formNotes.trim(),
      dueDate: formDueDate || undefined,
      priority: formPriority,
      subtasks: formSubtasks,
      recurring: formRecurring,
      linkedItem:
        formLinkedType !== "none" && formLinkedTitle
          ? {
              type: formLinkedType,
              id: `link-${Date.now()}`,
              title: formLinkedTitle,
            }
          : undefined,
    });

    setIsModalOpen(false);
    loadPlans();
  };

  // Toggle completion
  const handleToggleTask = (id: string) => {
    hybridStore.togglePlan(id);
    loadPlans();
  };

  // Toggle subtask
  const handleToggleSubtask = (planId: string, subId: string) => {
    hybridStore.toggleSubtask(planId, subId);
    loadPlans();
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    hybridStore.deletePlan(id);
    setConfirmDeleteId(null);
    loadPlans();
  };

  // Add subtask in modal
  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setFormSubtasks((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        text: newSubtaskText.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskText("");
  };

  // Remove subtask in modal
  const handleRemoveSubtask = (id: string) => {
    setFormSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  // Filter tasks by view mode
  const filteredPlans = plans.filter((task) => {
    // 1. Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNotes = task.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }

    // 2. Priority filter
    if (priorityFilter !== "all" && task.priority !== priorityFilter) {
      return false;
    }

    // 3. View Mode
    if (viewMode === "completed") {
      return task.completed;
    }

    if (viewMode === "today") {
      // Completed today or pending due today or overdue
      if (task.completed) return false;
      return !task.dueDate || (todayStr ? task.dueDate <= todayStr : true);
    }

    if (viewMode === "upcoming") {
      if (task.completed) return false;
      return !!task.dueDate && (todayStr ? task.dueDate > todayStr : false);
    }

    // "all" mode
    return true;
  });

  const isOverdue = (task: LittlePlanTask) => {
    return !task.completed && !!task.dueDate && !!todayStr && task.dueDate < todayStr;
  };

  const todayCount = plans.filter(
    (t) => !t.completed && (!t.dueDate || (todayStr ? t.dueDate <= todayStr : true))
  ).length;
  const upcomingCount = plans.filter(
    (t) => !t.completed && !!t.dueDate && (todayStr ? t.dueDate > todayStr : false)
  ).length;
  const completedCount = plans.filter((t) => t.completed).length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-warm)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-[var(--accent-sage)] uppercase">
            <ListTodo className="w-4 h-4" />
            <span>Personal Planning Notebook</span>
          </div>
          <h1 className="font-literary text-3xl sm:text-4xl font-semibold text-[var(--text-main)] tracking-tight mt-1">
            Little Plans
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] italic mt-1">
            Gentle intentions for writing, reading, and daily sanctuary life.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-sage)] text-white text-xs font-semibold hover:bg-[var(--accent-olive)] transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Little Plan</span>
        </button>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-sage-surface)]/60 border border-[var(--border-warm)] self-start">
          {[
            { id: "today" as const, label: "Today", count: todayCount },
            { id: "upcoming" as const, label: "Upcoming", count: upcomingCount },
            { id: "completed" as const, label: "Completed", count: completedCount },
            { id: "all" as const, label: "All Plans", count: plans.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === tab.id
                  ? "bg-[var(--bg-paper)] text-[var(--text-main)] shadow-xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  viewMode === tab.id
                    ? "bg-[var(--bg-sage-surface)] text-[var(--accent-sage)] font-bold"
                    : "bg-black/5 text-[var(--text-muted)]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Priority Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-sage)]"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {filteredPlans.length === 0 ? (
          <div className="py-16 text-center space-y-3 border border-dashed border-[var(--border-warm)] rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-sage-surface)] text-[var(--accent-sage)] mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-literary text-base font-semibold text-[var(--text-main)]">
              {viewMode === "completed"
                ? "No completed tasks yet."
                : "No plans in this view."}
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {viewMode === "completed"
                ? "As you complete intentions, they will gently rest here."
                : "Set a calm intention for today's reading, writing, or quiet reflection."}
            </p>
            {viewMode !== "completed" && (
              <button
                onClick={handleOpenNewModal}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent-sage)] text-white text-xs font-semibold hover:bg-[var(--accent-olive)] transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create an Intention</span>
              </button>
            )}
          </div>
        ) : (
          filteredPlans.map((task) => {
            const overdue = isOverdue(task);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  task.completed
                    ? "bg-[var(--bg-sage-surface)]/25 border-[var(--border-warm)]/60 opacity-70"
                    : overdue
                    ? "bg-amber-50/40 border-amber-200/80"
                    : "bg-[var(--bg-paper)] border-[var(--border-warm)] shadow-xs hover:border-[var(--accent-sage)]/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 shrink-0 text-[var(--accent-sage)] hover:opacity-80 transition-opacity"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-[var(--accent-sage)] text-white" />
                      ) : (
                        <Circle className="w-5 h-5 text-[var(--border-warm)] hover:text-[var(--accent-sage)]" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-literary text-sm sm:text-base font-semibold leading-snug ${
                            task.completed
                              ? "line-through text-[var(--text-muted)]"
                              : "text-[var(--text-main)]"
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider ${
                            task.priority === "high"
                              ? "bg-rose-100/70 text-rose-800 border border-rose-200"
                              : task.priority === "medium"
                              ? "bg-amber-100/70 text-amber-800 border border-amber-200"
                              : "bg-stone-100 text-stone-700 border border-stone-200"
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Overdue Badge */}
                        {overdue && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.notes && (
                        <p className="text-xs text-[var(--text-body)] leading-relaxed">
                          {task.notes}
                        </p>
                      )}

                      {/* Metadata Row: Due Date, Recurring, Linked Item */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[var(--text-muted)]">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {task.dueDate === todayStr
                                ? "Today"
                                : new Date(task.dueDate + "T00:00:00").toLocaleDateString(
                                    undefined,
                                    { month: "short", day: "numeric" }
                                  )}
                            </span>
                          </span>
                        )}

                        {task.recurring && task.recurring !== "none" && (
                          <span className="capitalize">
                            • Repeats {task.recurring}
                          </span>
                        )}

                        {task.linkedItem && (
                          <span className="flex items-center gap-1 text-[var(--accent-sage)] font-medium">
                            {task.linkedItem.type === "journal" ? (
                              <BookHeart className="w-3 h-3" />
                            ) : task.linkedItem.type === "reading" ? (
                              <BookOpen className="w-3 h-3" />
                            ) : (
                              <PenTool className="w-3 h-3" />
                            )}
                            <Link
                              href={
                                task.linkedItem.type === "journal"
                                  ? "/journal"
                                  : task.linkedItem.type === "reading"
                                  ? "/library"
                                  : "/write"
                              }
                              className="hover:underline truncate max-w-xs"
                            >
                              {task.linkedItem.title}
                            </Link>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 rounded-md hover:bg-[var(--bg-sage-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {confirmDeleteId === task.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                        <span className="text-[10px] text-red-800 font-medium px-1">
                          Delete?
                        </span>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-semibold hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 text-[10px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(task.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtasks List */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="pl-8 pt-1 space-y-1.5 border-t border-[var(--border-warm)]/40 mt-2">
                    {task.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => handleToggleSubtask(task.id, sub.id)}
                        className="flex items-center gap-2 text-xs text-[var(--text-body)] cursor-pointer group"
                      >
                        <button className="text-[var(--text-muted)] group-hover:text-[var(--accent-sage)]">
                          {sub.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span
                          className={`${
                            sub.completed ? "line-through text-[var(--text-muted)]" : ""
                          }`}
                        >
                          {sub.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] max-w-lg w-full rounded-2xl border border-[var(--border-warm)] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-[var(--text-main)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-warm)]">
              <h3 className="font-literary text-xl font-semibold">
                {editingPlan ? "Edit Little Plan" : "New Little Plan"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-main)]">
                  Intention / Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Read 20 pages of Virginia Woolf..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-sage)]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-main)]">
                  Quiet Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="What details or context would you like to remember?"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-sage)] resize-none"
                />
              </div>

              {/* Date & Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-main)]">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-main)]">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) =>
                      setFormPriority(e.target.value as "low" | "medium" | "high")
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs focus:outline-none"
                  >
                    <option value="low">Low (Gentle)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Focus)</option>
                  </select>
                </div>
              </div>

              {/* Recurrence */}
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-main)]">
                  Repetition (Optional)
                </label>
                <select
                  value={formRecurring}
                  onChange={(e) =>
                    setFormRecurring(
                      e.target.value as "none" | "daily" | "weekly" | "monthly"
                    )
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs focus:outline-none"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Repeats Daily</option>
                  <option value="weekly">Repeats Weekly</option>
                  <option value="monthly">Repeats Monthly</option>
                </select>
              </div>

              {/* Linked Sanctuary Item */}
              <div className="space-y-2 p-3 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-sage-surface)]/30">
                <label className="font-medium text-[var(--text-main)] block">
                  Link to Sanctuary Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formLinkedType}
                    onChange={(e) => setFormLinkedType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs focus:outline-none"
                  >
                    <option value="none">No Link</option>
                    <option value="journal">Journal Entry</option>
                    <option value="reading">Reading / Book</option>
                    <option value="document">Writing Document</option>
                  </select>

                  {formLinkedType !== "none" && (
                    <input
                      type="text"
                      value={formLinkedTitle}
                      onChange={(e) => setFormLinkedTitle(e.target.value)}
                      placeholder="Title of book/entry..."
                      className="w-full px-2.5 py-1.5 rounded border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Subtasks */}
              <div className="space-y-2">
                <label className="font-medium text-[var(--text-main)]">
                  Sub-intentions ({formSubtasks.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    placeholder="Add step..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-sage-surface)] text-xs font-semibold hover:bg-[var(--accent-sage)] hover:text-white transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formSubtasks.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {formSubtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between gap-2 p-1.5 rounded bg-[var(--bg-sage-surface)]/50 text-xs"
                      >
                        <span>{sub.text}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(sub.id)}
                          className="text-[var(--text-muted)] hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[var(--border-warm)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-warm)] text-xs font-medium hover:bg-[var(--bg-sage-surface)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[var(--accent-sage)] text-white text-xs font-semibold hover:bg-[var(--accent-olive)] transition-all shadow-xs"
                >
                  {editingPlan ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
