/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Check, X, Calendar, Clock, AlertCircle, Plus, Trash } from "lucide-react";
import { ScheduledTask } from "../types";

interface SchedulesManagerProps {
  schedules: ScheduledTask[];
  onSaveSchedules: (updatedSchedules: ScheduledTask[]) => void;
  onClose: () => void;
}

export default function SchedulesManager({ schedules, onSaveSchedules, onClose }: SchedulesManagerProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(schedules[0]?.id || "");
  const [tasks, setTasks] = useState<ScheduledTask[]>(schedules);
  const [notification, setNotification] = useState("");

  const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const updateCurrentTask = (updates: Partial<ScheduledTask>) => {
    if (!currentTask) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === currentTask.id ? { ...t, ...updates } : t))
    );
  };

  const updateRunDay = (day: string, checked: boolean) => {
    if (!currentTask) return;
    updateCurrentTask({
      runDays: {
        ...currentTask.runDays,
        [day]: checked,
      },
    });
  };

  const handleSave = () => {
    onSaveSchedules(tasks);
    setNotification("Lưu cấu hình lập lịch xuất tự động thành công!");
    setTimeout(() => {
      setNotification("");
      onClose();
    }, 1200);
  };

  const handleRunBackupNow = () => {
    setNotification("Đang chuẩn bị chạy sao lưu cưỡng bức theo lịch trình...");
    setTimeout(() => {
      setNotification("Đã tiến hành tự động quét, tổng hợp và kết xuất báo cáo IA BANG!");
    }, 1500);
  };

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayLabels: { [key: string]: string } = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "Chủ nhật",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs font-sans">
      <div className="w-[850px] bg-slate-100 border border-slate-305 rounded-md shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white px-3.5 py-2 flex items-center justify-between text-xs font-bold leading-normal">
          <div className="flex items-center gap-1.5 uppercase tracking-wide">
            <Calendar className="w-4 h-4 text-emerald-405" />
            <span>Schedules Manager - Quản lý tác vụ xuất báo cáo tự động</span>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:bg-red-650 hover:text-white rounded p-1 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Info label banner */}
        <div className="bg-white px-5 py-3 border-b border-slate-205">
          <h3 className="text-xs font-bold text-slate-800">Cấu hình Tác vụ Tự động hàng ngày gửi A0</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Phần mềm Advance Economic cho phép người dùng thiết lập lịch trình xuất dữ liệu tự động hằng ngày vào các khung giờ quy định (Ví dụ: <strong>02h00</strong> hằng ngày) để kết xuất dữ liệu gửi cấp quản lý.
          </p>
        </div>

        {/* Grid panel body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Left panel: Schedule list */}
          <div className="md:col-span-12 lg:col-span-7 space-y-3">
            <div className="bg-white border border-slate-250 rounded p-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 mb-2 select-none uppercase tracking-wide">Danh sách tác vụ lập lịch</h4>
              <div className="overflow-x-auto border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-250 font-bold text-slate-650 select-none">
                      <th className="py-1.5 px-2">Task Name</th>
                      <th className="py-1.5 px-2">Next Run</th>
                      <th className="py-1.5 px-2">Last Run</th>
                      <th className="py-1.5 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`border-b border-slate-200 cursor-pointer transition-colors ${
                          selectedTaskId === task.id ? "bg-teal-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="py-2 px-2 font-semibold text-slate-800">{task.name}</td>
                        <td className="py-2 px-2 font-mono text-slate-600 text-[11px]">{task.nextStart}</td>
                        <td className="py-2 px-2 font-mono text-slate-500 text-[11px]">{task.lastExecution}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${task.active ? "bg-teal-500" : "bg-slate-400"}`} title={task.active ? "Kích hoạt" : "Hủy kích hoạt"}></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected activities logs */}
            {currentTask && (
              <div className="bg-white border border-slate-250 rounded p-3 shadow-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Hoạt động trong tác vụ ({currentTask.name})</h4>
                  <button
                    id="btn_run_backup"
                    onClick={handleRunBackupNow}
                    className="px-2 py-0.5 bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 rounded text-[10px] font-bold"
                  >
                    Chạy kiểm tra ngay
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-200 p-2.5 rounded text-[10px] font-mono h-20 overflow-y-auto leading-relaxed border border-slate-800">
                  <div className="text-teal-400 font-bold">[SYS] Lập lịch trình kết xuất tự động cho {currentTask.name}</div>
                  <div className="text-slate-400">[OK] Lần quét cuối: {currentTask.lastExecution} (Mã: 3.593s)</div>
                  <div className="text-slate-400">[PENDING] Lần quét tiếp theo: {currentTask.nextStart}</div>
                  <div className="text-slate-300">• Loại báo cáo: Excel Report (Tích lũy & Differential)</div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Task details editor */}
          <div className="md:col-span-12 lg:col-span-5 bg-white border border-slate-250 rounded p-4.5 space-y-3.5 shadow-xs">
            {currentTask ? (
              <>
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider pb-1.5 border-b border-slate-200 flex justify-between">
                  <span>Thiết lập thuộc tính lập lịch</span>
                  <span className="font-mono text-[9px] bg-slate-100 px-1.5 text-slate-500 rounded lowercase">id: {currentTask.id}</span>
                </h4>

                <div className="space-y-3 shrink-0">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tên Tác Vụ:</label>
                    <input
                      id="sched_input_name"
                      type="text"
                      value={currentTask.name}
                      onChange={(e) => updateCurrentTask({ name: e.target.value })}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs select-text focus:outline-hidden focus:border-teal-600 transition-colors"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Chu kỳ xuất:</label>
                      <select
                        id="sched_select_period"
                        value={currentTask.period}
                        onChange={(e) => updateCurrentTask({ period: e.target.value as any })}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-hidden focus:border-teal-600 cursor-pointer"
                      >
                        <option value="Hour">Mỗi giờ (Continuous)</option>
                        <option value="Day">Mỗi ngày (Daily)</option>
                        <option value="Week">Mỗi tuần (Weekly)</option>
                        <option value="Month">Mỗi tháng (Monthly)</option>
                      </select>
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Giờ xuất hàng ngày:</span>
                      </label>
                      {/* Set time of day e.g., 02:00 */}
                      <input
                        id="sched_input_time"
                        type="text"
                        value={currentTask.timeOfDay}
                        onChange={(e) => updateCurrentTask({ timeOfDay: e.target.value, nextStart: `12.09.2021 ${e.target.value}` })}
                        placeholder="e.g. 02:00"
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold select-text focus:outline-hidden focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Gửi dữ liệu của:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          id="sched_input_last"
                          type="number"
                          value={currentTask.executeForLast}
                          onChange={(e) => updateCurrentTask({ executeForLast: parseInt(e.target.value, 10) || 1 })}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-center font-bold"
                          min="1"
                        />
                        <span className="text-xs text-slate-500 font-medium"> ngày gần nhất</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 justify-end">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Trạng thái:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none py-1">
                        <input
                          id="sched_input_active"
                          type="checkbox"
                          checked={currentTask.active}
                          onChange={(e) => updateCurrentTask({ active: e.target.checked })}
                          className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-xs font-medium text-slate-700">Kích hoạt tác vụ</span>
                      </label>
                    </div>
                  </div>

                  {/* Executing days selection */}
                  <div className="space-y-1.5 bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Chạy vào các ngày trong tuần:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {dayNames.map((dName) => (
                        <label key={dName} className="flex items-center gap-1.5 cursor-pointer py-0.5 hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={!!currentTask.runDays[dName]}
                            onChange={(e) => updateRunDay(dName, e.target.checked)}
                            className="w-3.5 h-3.5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-[11px] text-slate-600 font-medium">{dayLabels[dName]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Không có tác vụ nào được chọn.
              </div>
            )}
          </div>
        </div>

        {/* Global state notify */}
        {notification && (
          <div className="mx-4 mb-2 bg-blue-50 text-blue-800 text-xs py-2 px-3 border border-blue-200 rounded flex gap-1.5 items-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
            <span className="font-semibold">{notification}</span>
          </div>
        )}

        {/* Modal Action footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-150 border-t border-slate-200">
          <button
            id="btn_sched_save"
            onClick={handleSave}
            className="px-6 py-1.8 bg-teal-800 hover:bg-teal-700 active:bg-teal-900 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Lưu cấu hình (Save)</span>
          </button>
          <button
            id="btn_sched_cancel"
            onClick={onClose}
            className="px-6 py-1.8 bg-white border border-slate-300 text-slate-705 hover:bg-slate-50 text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}
