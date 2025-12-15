"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, UserX } from "lucide-react";

// --- Generic Delete Button for Projects & Members ---
interface DeleteItemProps {
  id: string;
  type: "project" | "member";
  name: string;
}

export function DeleteItemButton({ id, type, name }: DeleteItemProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${type} "${name}"? This cannot be undone.`)) return;

    setLoading(true);
    try {
      // API routes assumed: /api/projects/[id] or /api/members/[id]
      const endpoint = type === "project" ? `/api/projects/${id}` : `/api/members/${id}`;
      const res = await fetch(endpoint, { method: "DELETE" });

      if (res.ok) {
        router.refresh();
      } else {
        alert(`Failed to delete ${type}`);
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title={`Delete ${type}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}

// --- Delete Own Account Button ---
export function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDeleteAccount() {
    const confirmation = prompt('Type "DELETE" to confirm you want to delete your account permanently.');
    if (confirmation !== "DELETE") return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        router.push("/"); // Redirect to home/login
      } else {
        alert("Failed to delete account");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDeleteAccount}
      disabled={loading}
      className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-100"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
      Delete My Account
    </button>
  );
}