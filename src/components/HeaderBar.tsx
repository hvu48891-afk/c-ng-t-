/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cpu, Phone, Mail, Award, Globe } from "lucide-react";

export default function HeaderBar() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs font-sans">
      {/* Upper line: Company header as in PDF */}
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between text-slate-700 border-b border-dashed border-slate-200">
        <div className="flex items-center gap-3">
          {/* Custom logo representing TT-GROUP logo in PDF */}
          <div className="flex items-center gap-1.5 bg-red-600 text-white font-extrabold px-3 py-1.5 rounded-sm italic tracking-tighter shadow-sm text-sm">
            <Cpu className="w-4 h-4 text-white animate-pulse" />
            <span>TT-GROUP</span>
          </div>
          <div>
            <h1 className="text-xs uppercase font-extrabold text-slate-800 tracking-wide">
              CÔNG TY CỔ PHẦN TỔ HỢP CHUYỂN GIAO CÔNG NGHỆ
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              Trụ sở: Số 15 ngõ 71, phố Đỗ Quang, Trung Hoà, Cầu Giấy, Hà Nội
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-slate-500 mt-2 md:mt-0 font-medium">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>024.2224.9599</span>
          </span>
          <span className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>info@tt-group.com.vn</span>
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>tt-group.com.vn</span>
          </span>
        </div>
      </div>

      {/* Main Software Title Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-3 px-6 select-none">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 text-slate-900 rounded p-1.5 text-xs font-bold leading-none shrink-0 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white">Systems</span>
              <span className="text-sm font-black text-rose-50 flex items-center gap-1">AMR</span>
            </div>
            <div>
              <h2 className="text-sm md:text-base font-extrabold tracking-tight uppercase text-emerald-450 text-emerald-450 font-sans">
                PHẦN MỀM THU THẬP DỮ LIỆU CÔNG TƠ TỰ ĐỘNG
              </h2>
              <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                <span>Automatic Meter Reading System</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-450 font-bold">Advance Economic Plus</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-slate-700/60 backdrop-blur-xs border border-slate-700 rounded px-2.5 py-1 text-right">
              <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Phiên bản hệ thống</div>
              <div className="text-xs font-mono font-bold text-emerald-450">V1.0921 Build 0626</div>
            </div>
            <div className="bg-emerald-600/10 border border-emerald-500/20 rounded px-2.5 py-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-450 animate-bounce" />
              <div className="text-left">
                <div className="text-[9px] text-slate-400 font-semibold uppercase">Chứng nhận</div>
                <div className="text-[10px] font-bold text-emerald-450">Landis+Gyr Official</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
