/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, Play, Pause, RotateCw, X, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { SystemService } from "../types";

interface DriversSettingsProps {
  services: SystemService[];
  onToggleService: (serviceName: string, newState: "running" | "stopped") => void;
  onClose: () => void;
}

export default function DriversSettings({ services, onToggleService, onClose }: DriversSettingsProps) {
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(null);
  const [showRightClickMenu, setShowRightClickMenu] = useState<{ x: number; y: number; sName: string } | null>(null);

  const handleRowClick = (sName: string) => {
    setSelectedServiceName(sName);
  };

  const handleRightClick = (e: React.MouseEvent, sName: string) => {
    e.preventDefault();
    setSelectedServiceName(sName);
    setShowRightClickMenu({
      x: e.clientX,
      y: e.clientY,
      sName: sName
    });
  };

  const triggerAction = (action: string) => {
    const sName = showRightClickMenu?.sName || selectedServiceName;
    if (!sName) return;

    if (action === "Run" || action === "Start") {
      onToggleService(sName, "running");
    } else if (action === "Stop" || action === "Pause") {
      onToggleService(sName, "stopped");
    } else if (action === "Restart") {
      onToggleService(sName, "stopped");
      setTimeout(() => {
        onToggleService(sName, "running");
      }, 500);
    }
    
    setShowRightClickMenu(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs font-sans">
      <div 
        onClick={() => setShowRightClickMenu(null)}
        className="w-[720px] bg-slate-100 border border-slate-300 rounded-md shadow-2xl overflow-hidden"
      >
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-3.5 py-2 flex items-center justify-between text-xs font-bold leading-normal">
          <div className="flex items-center gap-1.5 uppercase tracking-wide">
            <Shield className="w-4 h-4 text-emerald-450" />
            <span>Cửa sổ quản trị hệ thống - Drivers & Services Control</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:bg-red-600 hover:text-white rounded p-1 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Info panel */}
        <div className="bg-white px-5 py-3 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800">Kiểm tra & Cài đặt Trạng thái Drivers</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Nhấp chuột phải vào dòng máy chủ dịch vụ để <strong>Run</strong> (Chạy), <strong>Stop</strong> (Dừng) hoặc <strong>Restart</strong> (Khởi động lại) driver kết nối thu thập dữ liệu công tơ.
          </p>
        </div>

        {/* Services Table */}
        <div className="p-4 bg-slate-50">
          <div className="max-h-[350px] overflow-y-auto border border-slate-305 rounded-sm bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-600 select-none">
                  <th className="py-2 px-3 w-8">#</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-4 text-center w-24">State</th>
                  <th className="py-2 px-4 text-center w-28">Hành động nhanh</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => {
                  const isSelected = selectedServiceName === service.name;
                  const isRunning = service.state === "running";

                  return (
                    <tr
                      key={service.name}
                      onClick={() => handleRowClick(service.name)}
                      onContextMenu={(e) => handleRightClick(e, service.name)}
                      className={`border-b border-slate-200 cursor-pointer select-none transition-colors ${
                        isSelected ? "bg-blue-100 hover:bg-blue-105" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-2 px-3 font-mono text-slate-400 text-[10px] text-center">{index + 1}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-800">{service.name}</td>
                      <td className="py-2 px-3 text-slate-500 font-medium truncate max-w-[240px]" title={service.description}>
                        {service.description}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold leading-none bg-slate-100 border">
                          <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                          <span className={isRunning ? "text-emerald-700" : "text-red-700"}>
                            {isRunning ? "RUNNING" : "STOPPED"}
                          </span>
                        </span>
                      </td>
                      <td className="py-1 px-3 text-center">
                        <div className="flex justify-center">
                          {isRunning ? (
                            <button
                              id={`btn_stop_${service.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleService(service.name, "stopped");
                              }}
                              className="px-2 py-0.8 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded text-[10px] font-semibold flex items-center justify-center gap-1 shrink-0"
                            >
                              <Pause className="w-2.5 h-2.5" />
                              <span>Stop</span>
                            </button>
                          ) : (
                            <button
                              id={`btn_run_${service.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleService(service.name, "running");
                              }}
                              className="px-2 py-0.8 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 hover:border-emerald-300 rounded text-[10px] font-semibold flex items-center justify-center gap-1 shrink-0 animate-bounce"
                            >
                              <Play className="w-2.5 h-2.5" />
                              <span>Run</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between p-4 bg-slate-100 border-t border-slate-200">
          <div className="text-[11px] text-slate-500 select-all font-mono">
            Selected: <strong className="text-slate-800">{selectedServiceName || "No service selected"}</strong>
          </div>
          <button
            id="btn_services_close"
            onClick={onClose}
            className="px-5 py-1.5 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Hoàn thành thiết lập</span>
          </button>
        </div>
      </div>

      {/* Virtual Custom Right-Click Menu mimicking page 7 */}
      {showRightClickMenu && (
        <div
          id="service_context_menu"
          className="fixed bg-white border border-slate-320 rounded shadow-md py-1 w-44 text-xs font-semibold text-slate-700 z-55 shadow-lg"
          style={{ left: showRightClickMenu.x, top: showRightClickMenu.y }}
        >
          <div className="px-2.5 py-1 bg-slate-50 border-b border-slate-200 text-[9px] text-slate-400 uppercase tracking-wider truncate font-mono">
            {showRightClickMenu.sName}
          </div>
          <button
            onClick={() => triggerAction("Run")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 text-emerald-700"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-100" />
            <span>Run (Chạy)</span>
          </button>
          <button
            onClick={() => triggerAction("Stop")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 text-red-700"
          >
            <Pause className="w-3.5 h-3.5 fill-red-100" />
            <span>Stop (Dừng)</span>
          </button>
          <button
            onClick={() => triggerAction("Restart")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 text-blue-700"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Restart (Khởi động lại)</span>
          </button>
          <div className="border-t border-slate-150 my-1"></div>
          <button
            onClick={() => triggerAction("Restart")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-400 cursor-not-allowed flex items-center gap-2"
            disabled
          >
            <span>Install Service</span>
          </button>
        </div>
      )}
    </div>
  );
}
