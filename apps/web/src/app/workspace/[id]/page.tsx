"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import Image from "next/image";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  acceptedAt: string | null;
  expiresAt: string;
  inviter: {
    name: string;
    email: string;
  };
}

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const workspaceId = params.id as string;
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  const loadData = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const [membersRes, invitationsRes] = await Promise.all([
        fetch(`${apiUrl}/workspaces/${workspaceId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/invitations/workspaces/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (invitationsRes.ok) {
        const invitationsData = await invitationsRes.json();
        setInvitations(invitationsData);
      }
    } catch (error) {
      showToast("Ошибка при загрузке данных", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      showToast("Введите email", "error");
      return;
    }

    setInviting(true);

    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${apiUrl}/invitations/workspaces/${workspaceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (response.ok) {
        showToast("Приглашение отправлено!", "success");
        setInviteEmail("");
        loadData();
      } else {
        const error = await response.json();
        showToast(error.message || "Ошибка при отправке приглашения", "error");
      }
    } catch (error) {
      showToast("Ошибка при отправке приглашения", "error");
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const token = getToken();
      if (!token) {
        return;
      }

      const response = await fetch(`${apiUrl}/invitations/${invitationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast("Приглашение отменено", "success");
        loadData();
      }
    } catch (error) {
      showToast("Ошибка при отмене приглашения", "error");
    }
  };

  const roleLabels: Record<string, string> = {
    OWNER: "Владелец",
    ADMIN: "Администратор",
    MEMBER: "Участник",
    VIEWER: "Наблюдатель",
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="sticker-card bg-white text-center">
          <p className="text-foreground/70">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="sticker-card bg-white mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-xl bg-pastel-blue hover:bg-accent-blue transition-colors"
          >
            ← Назад
          </button>
          <h1 className="text-3xl font-bold text-foreground">Настройки Workspace</h1>
        </div>
      </div>

      {/* Пригласить участника */}
      <div className="sticker-card bg-white mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Пригласить участника</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input-base"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Роль
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="select-base"
              >
                <option value="MEMBER">Участник</option>
                <option value="ADMIN">Администратор</option>
                <option value="VIEWER">Наблюдатель</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="btn-primary disabled:opacity-50"
          >
            {inviting ? "Отправка..." : "Отправить приглашение"}
          </button>
        </form>
      </div>

      {/* Участники */}
      <div className="sticker-card bg-white mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Участники</h2>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-xl bg-pastel-blue/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pastel-blue flex items-center justify-center text-sm font-semibold text-blue-800">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{member.name || member.email}</div>
                  <div className="text-sm text-foreground/70">{member.email}</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pastel-purple text-purple-800">
                {roleLabels[member.role] || member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Приглашения */}
      {invitations.length > 0 && (
        <div className="sticker-card bg-white">
          <h2 className="text-2xl font-bold text-foreground mb-4">Отправленные приглашения</h2>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 rounded-xl bg-pastel-yellow/20"
              >
                <div>
                  <div className="font-semibold text-foreground">{invitation.email}</div>
                  <div className="text-sm text-foreground/70">
                    Приглашен {invitation.inviter.name} • Роль: {roleLabels[invitation.role] || invitation.role}
                    {invitation.acceptedAt ? (
                      <span className="text-green-600 ml-2">✓ Принято</span>
                    ) : (
                      <span className="text-orange-600 ml-2">Ожидает</span>
                    )}
                  </div>
                </div>
                {!invitation.acceptedAt && (
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="btn-secondary text-sm"
                  >
                    Отменить
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


