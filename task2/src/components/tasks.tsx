"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import { Task, TasksResponse } from "@/types/tasks";

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced fetch function
  const fetchTasks = useCallback(
    debounce(async (query: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:3000/api/tasks?status=done&limit=10${
            query ? `&search=${encodeURIComponent(query)}` : ""
          }`
        );
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data: TasksResponse = await response.json();
        setTasks(data.items);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Fetch tasks when search changes
  useEffect(() => {
    fetchTasks(search);
    return () => fetchTasks.cancel();
  }, [search, fetchTasks]);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Retry button handler
  const handleRetry = useCallback(() => {
    fetchTasks(search);
  }, [fetchTasks, search]);

  // Memoize task list to prevent unnecessary re-renders
  const taskList = useMemo(() => {
    return tasks.map((task) => (
      <li key={task._id} className="p-2 border-b">
        {task.title} - {task.status}
      </li>
    ));
  }, [tasks]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Tasks</h1>

      {/* Search Input */}
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search tasks..."
        className="w-full p-2 mb-4 border rounded"
      />

      {/* Loading State */}
      {loading && <p>Loading tasks...</p>}

      {/* Error State with Retry */}
      {error && (
        <div className="text-red-500 mb-4">
          <p>Error: {error}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tasks.length === 0 && (
        <p className="text-gray-500">No tasks found.</p>
      )}

      {/* Task List */}
      {!loading && !error && tasks.length > 0 && (
        <ul className="border rounded">{taskList}</ul>
      )}
    </div>
  );
};

export default TasksPage;