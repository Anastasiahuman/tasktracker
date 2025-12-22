"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      fetchInvitation(tokenParam);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchInvitation = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/invitations/token/${token}`);
      if (response.ok) {
        const data = await response.json();
        setInvitation(data);
        setFormData((prev) => ({ ...prev, name: data.email.split("@")[0] }));
      } else {
        const error = await response.json();
        showToast(error.message || "Приглашение не найдено или истекло", "error");
      }
    } catch (error) {
      showToast("Ошибка при загрузке приглашения", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      showToast("Токен приглашения отсутствует", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Пароли не совпадают", "error");
      return;
    }

    if (formData.password.length < 6) {
      showToast("Пароль должен содержать минимум 6 символов", "error");
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      // Регистрация (создание пользователя)
      const registerResponse = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: invitation.email,
          name: formData.name,
          password: formData.password,
        }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        throw new Error(error.message || "Ошибка регистрации");
      }

      const { user, accessToken, refreshToken } = await registerResponse.json();

      // Сохранение токенов
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Принятие приглашения
      const acceptResponse = await fetch(`${apiUrl}/invitations/accept/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!acceptResponse.ok) {
        throw new Error("Ошибка при принятии приглашения");
      }

      showToast("Регистрация успешна! Добро пожаловать!", "success");
      router.push("/");
    } catch (error: any) {
      showToast(error.message || "Ошибка регистрации", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto mt-20">
        <div className="sticker-card bg-white text-center">
          <p className="text-foreground/70">Загрузка приглашения...</p>
        </div>
      </div>
    );
  }

  if (!token || !invitation) {
    return (
      <div className="w-full max-w-md mx-auto mt-20">
        <div className="sticker-card bg-white text-center">
          <div className="mb-6">
            <Image
              src="/images/Ежик 1.png"
              alt="Ежик"
              width={120}
              height={120}
              className="rounded-full mx-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Приглашение не найдено
          </h2>
          <p className="text-foreground/70 mb-6">
            Ссылка приглашения недействительна или истекла. Попросите отправить новое приглашение.
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-20">
      <div className="sticker-card bg-white">
        <div className="text-center mb-6">
          <Image
            src="/images/Крош 1.png"
            alt="Крош"
            width={80}
            height={80}
            className="rounded-full mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Добро пожаловать!
          </h1>
          <p className="text-foreground/70">
            Вас пригласили в <strong>{invitation.workspace.name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Email
            </label>
            <input
              type="email"
              value={invitation.email}
              disabled
              className="input-base bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Имя <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-base"
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Пароль <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="input-base"
              placeholder="Минимум 6 символов"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Подтвердите пароль <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={6}
              className="input-base"
              placeholder="Повторите пароль"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-50"
          >
            {submitting ? "Регистрация..." : "Зарегистрироваться и присоединиться"}
          </button>
        </form>
      </div>
    </div>
  );
}


