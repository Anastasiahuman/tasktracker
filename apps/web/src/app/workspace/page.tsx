"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function WorkspaceSelectionPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadWorkspaces();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadWorkspaces = async () => {
    try {
      const data = await apiClient.get<Workspace[]>("/workspaces");
      setWorkspaces(data);
    } catch (err: any) {
      setError(err.message || "Failed to load workspaces");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      const workspace = await apiClient.post<Workspace>("/workspaces", {
        name: workspaceName,
      });
      await selectWorkspace(workspace.id);
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
    } finally {
      setIsCreating(false);
      setWorkspaceName("");
    }
  };

  const selectWorkspace = async (workspaceId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("task-tracker-workspace-id", workspaceId);
    }
    router.push("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[var(--text)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="sticker-card bg-white w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-6 text-center">
          Select or Create Workspace
        </h1>

        {/* Create Workspace */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
            Create New Workspace
          </h2>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              required
              className="input-base"
              placeholder="Workspace name"
            />
            {error && <div className="error-text">{error}</div>}
            <button
              type="submit"
              disabled={isCreating}
              className="btn-primary disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Workspace"}
            </button>
          </form>
        </div>

        {/* Existing Workspaces */}
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
            Existing Workspaces
          </h2>
          {workspaces.length === 0 ? (
            <p className="text-[var(--textMuted)]">No workspaces found</p>
          ) : (
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => selectWorkspace(workspace.id)}
                  className="w-full p-4 rounded-2xl border-2 border-[var(--border)] hover:border-[var(--primary)] transition-colors text-left"
                >
                  <div className="font-semibold text-[var(--text)]">
                    {workspace.name}
                  </div>
                  {workspace.description && (
                    <div className="text-sm text-[var(--textMuted)] mt-1">
                      {workspace.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

