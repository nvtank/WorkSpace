"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email hoặc mật khẩu không chính xác");
      } else {
        toast.success("Đăng nhập thành công!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || "Đã xảy ra lỗi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-mesh flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white mb-4 shadow-elevation1">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Life & Study Hub
        </h1>
        <p className="text-ink-mute mt-2 text-base">
          Trung tâm điều hành cuộc sống, thói quen & học tập cá nhân
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-surface rounded-xl border border-hairline p-8 shadow-elevation1">
        <div className="mb-6">
          <span className="badge-pill mb-2">Đăng nhập</span>
          <h2 className="text-2xl font-bold text-ink mt-1">Chào mừng trở lại</h2>
          <p className="text-sm text-ink-mute mt-1">
            Nhập tài khoản cá nhân của bạn để tiếp tục
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lifehub.local"
                className="input-base pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-2"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang đăng nhập...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Đăng nhập <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-hairline text-center text-xs text-ink-mute">
          Dành riêng cho chủ sở hữu cá nhân • Mặc định sau seed:{" "}
          <span className="font-mono text-ink">admin@lifehub.local / AdminPassword123!</span>
        </div>
      </div>
    </div>
  );
}
