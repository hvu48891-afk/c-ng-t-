/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KeyRound, ShieldAlert, Check, X, Shield } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (userId: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("Supervisor");
  const [password, setPassword] = useState("Supervisor");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      // Allow case-insensitive Supervisor
      const standardUser = "supervisor";
      if (username.toLowerCase() === standardUser && (password === "Supervisor" || password === "supervisor" || password === "123456" || password === localStorage.getItem("amr_custom_pw"))) {
        onLoginSuccess(username);
      } else {
        setErrorMsg("Tên đăng nhập hoặc mật khẩu không đúng.");
        setIsSubmitting(false);
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none">
      <div className="w-[450px] bg-slate-100 border border-slate-300 rounded-md shadow-2xl overflow-hidden font-sans">
        {/* Title bar */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-3 py-1.5 flex items-center justify-between text-sm font-semibold select-all">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-200" />
            <span>Welcome to Advance System</span>
          </div>
          <button className="text-white hover:bg-red-600 rounded p-0.5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand Banner inside Dialog */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-full">
            <KeyRound className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Đăng nhập hệ thống</h2>
            <p className="text-xs text-slate-500 mt-0.5">Vui lòng nhập tài khoản Quản trị viên (Supervisor)</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs px-3 py-2 border border-red-200 rounded flex gap-2 items-start">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3.5">
            <div className="flex items-center gap-4">
              <label className="text-xs font-semibold text-slate-600 w-24 text-right">User name:</label>
              <input
                id="login_username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded text-sm focus:outline-hidden transition-colors"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-xs font-semibold text-slate-600 w-24 text-right">Password:</label>
              <input
                id="login_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded text-sm focus:outline-hidden transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 text-center">
            * Mật khẩu mặc định ban đầu là <strong className="text-slate-600 font-semibold">Supervisor</strong>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              id="btn_login_submit"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-1.5 bg-blue-700 active:bg-blue-800 text-white rounded text-xs font-medium hover:bg-blue-600 shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang xác thực..." : "Xác nhận"}</span>
            </button>
            <button
              id="btn_login_cancel"
              type="button"
              onClick={() => {
                setUsername("Supervisor");
                setPassword("Supervisor");
                setErrorMsg("");
              }}
              className="px-5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 active:bg-slate-100 rounded text-xs font-medium shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Làm lại</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
