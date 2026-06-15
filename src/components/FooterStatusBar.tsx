/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Key, LogOut, Check, X, Wifi, Database } from "lucide-react";

interface FooterProps {
  currentUser: string;
  onLogout: () => void;
  openSettings: () => void;
}

export default function FooterStatusBar({ currentUser, onLogout, openSettings }: FooterProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const currentSavedPw = localStorage.getItem("amr_custom_pw") || "Supervisor";

    if (oldPassword !== currentSavedPw && oldPassword.toLowerCase() !== currentSavedPw.toLowerCase()) {
      setPasswordError("Mật khẩu cũ không chính xác.");
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError("Mật khẩu mới phải từ 4 ký tự trở lên.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    // Success
    localStorage.setItem("amr_custom_pw", newPassword);
    setPasswordSuccess("Thành công! Đã thay đổi mật khẩu quản trị.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      setShowPasswordDialog(false);
      setPasswordSuccess("");
    }, 1500);
  };

  const getFormattedTime = () => {
    const h = String(currentTime.getHours()).padStart(2, "0");
    const m = String(currentTime.getMinutes()).padStart(2, "0");
    const s = String(currentTime.getSeconds()).padStart(2, "0");
    const d = String(currentTime.getDate()).padStart(2, "0");
    const mo = String(currentTime.getMonth() + 1).padStart(2, "0");
    const y = currentTime.getFullYear();
    return `${h}:${m}:${s} - ${d}/${mo}/${y}`;
  };

  return (
    <>
      <footer className="h-9 bg-slate-900 border-t border-slate-700 text-slate-300 text-xs px-3 flex items-center justify-between font-mono shrink-0 select-none relative">
        {/* Left: Supervisor dropup list */}
        <div className="flex items-center gap-3 h-full">
          <div className="relative">
            <button
              id="btn_supervisor_menu"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 px-3.5 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-450 border border-slate-700 rounded-sm cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>{currentUser}</span>
              <span className="text-[9px] opacity-70">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute bottom-10 left-0 w-48 bg-slate-800 border border-slate-700 rounded shadow-lg overflow-hidden py-1 z-40">
                <div className="px-3 py-1.5 border-b border-slate-700 text-[10px] text-slate-400 font-sans uppercase tracking-wider font-semibold">
                  Tài khoản
                </div>
                <button
                  id="btn_change_password"
                  onClick={() => {
                    setShowPasswordDialog(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2"
                >
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>Thay đổi mật khẩu</span>
                </button>
                <button
                  id="btn_logout_user"
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 border-t border-slate-750"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất (Logoff)</span>
                </button>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 border-l border-slate-700 pl-3">
            <span className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hệ thống: Bình thường</span>
            </span>
          </div>
        </div>

        {/* Center: System statistics / database state */}
        <div className="hidden lg:flex items-center gap-4 text-slate-400 text-[11px] font-sans">
          <span className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span>Kênh truyền IP: Hoạt động</span>
          </span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Cơ sở dữ liệu: SQLite/Local (Sẵn sàng)</span>
          </span>
        </div>

        {/* Right: Settings Quick Button + Clock */}
        <div className="flex items-center gap-3">
          <button
            id="btn_status_settings"
            onClick={openSettings}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-sm text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Module Settings / Configurations"
          >
            ⚙️ Cấu hình thiết lập
          </button>
          <div className="text-right text-[11px] text-slate-300 font-mono tracking-wider bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {getFormattedTime()}
          </div>
        </div>
      </footer>

      {/* Password Change Dialog Modal - Matching page 5 exactly! */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs">
          <div className="w-[420px] bg-slate-100 border border-slate-300 rounded-md shadow-2xl overflow-hidden font-sans">
            {/* Modal Title Bar */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-3 py-1.5 flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-200" />
                <span>Password change</span>
              </div>
              <button
                onClick={() => setShowPasswordDialog(false)}
                className="text-white hover:bg-red-600 rounded p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              <div className="flex gap-4 items-start bg-blue-50/50 p-3 rounded border border-blue-150">
                <div className="text-3xl">⚠️</div>
                <div className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Mật khẩu thay đổi sẽ được áp dụng cho tài khoản quản trị <code className="bg-white px-1 border border-slate-250 text-blue-700 font-mono rounded">Supervisor</code> hiện tại.
                </div>
              </div>

              {passwordError && (
                <div className="bg-red-50 text-red-700 text-xs px-3 py-2 border border-red-200 rounded">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-emerald-50 text-emerald-700 text-xs px-3 py-2 border border-emerald-250 rounded">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-3 pt-1">
                <div className="flex items-center">
                  <label className="text-xs font-semibold text-slate-600 w-32 text-right pr-4">Old password:</label>
                  <input
                    id="input_old_password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded text-sm focus:outline-hidden transition-colors"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <label className="text-xs font-semibold text-slate-600 w-32 text-right pr-4">New password:</label>
                  <input
                    id="input_new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded text-sm focus:outline-hidden transition-colors"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <label className="text-xs font-semibold text-slate-600 w-32 text-right pr-4">Confirm new password:</label>
                  <input
                    id="input_confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded text-sm focus:outline-hidden transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Action Ticks as in page 5 */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  id="btn_password_save"
                  type="submit"
                  className="px-5 py-1.5 bg-blue-700 active:bg-blue-800 text-white rounded text-xs font-medium hover:bg-blue-600 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác nhận</span>
                </button>
                <button
                  id="btn_password_cancel"
                  type="button"
                  onClick={() => setShowPasswordDialog(false)}
                  className="px-5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Đóng lại</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
