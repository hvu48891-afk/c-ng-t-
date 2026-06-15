/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Play, Check, RefreshCw, Terminal, Clock, Settings, FileText, CheckCircle2, ChevronDown, ListFilter } from "lucide-react";
import { StationGroup, MeterDevice, MeterChannel, LogMessage } from "../types";
import InteractiveChart from "./InteractiveChart";

interface DataCollectionModuleProps {
  stations: StationGroup[];
  selectedStation: StationGroup | null;
  selectedMeter: MeterDevice | null;
  selectedChannel: MeterChannel | null;
  onSelectChannel: (channel: MeterChannel, meter: MeterDevice) => void;
  onSelectMeter: (meter: MeterDevice) => void;
}

export default function DataCollectionModule({
  stations,
  selectedStation,
  selectedMeter,
  selectedChannel,
  onSelectChannel,
  onSelectMeter,
}: DataCollectionModuleProps) {
  // Option controls
  const [automatic, setAutomatic] = useState(true);
  const [execEvery, setExecEvery] = useState(1);
  const [execType, setExecType] = useState("days");
  const [forLast, setForLast] = useState(1);
  const [forLastType, setForLastType] = useState("days");

  // Read Checkbox list
  const [readReadout, setReadReadout] = useState(true);
  const [readLoadProfile, setReadLoadProfile] = useState(true);
  const [syncTime, setSyncTime] = useState(false);
  const [readEvents, setReadEvents] = useState(true);

  // Filters for displaying readings
  const [filterType, setFilterType] = useState<"Today" | "Yesterday" | "Custom" | "Last">("Custom");
  const [lastCycleCount, setLastCycleCount] = useState(48);
  const [customFromDate, setCustomFromDate] = useState("2021-09-09");
  const [customToDate, setCustomToDate] = useState("2021-09-11");

  // Log reader console
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionLogs, setCollectionLogs] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Active dataset derived based on filtering
  const defaultMeter = selectedMeter || stations[0]?.meters[0];
  const defaultChannel = selectedChannel || defaultMeter?.channels["+A"];

  const getFilteredData = () => {
    if (!defaultChannel || !defaultChannel.data) return [];
    const allData = defaultChannel.data;

    if (filterType === "Today") {
      // Return Sept 11, 2021 readings (most contemporary day in seed)
      return allData.filter((item) => item.timestamp.includes("11.09.2021"));
    } else if (filterType === "Yesterday") {
      // Return Sept 10, 2021 readings
      return allData.filter((item) => item.timestamp.includes("10.09.2021"));
    } else if (filterType === "Last") {
      // Return last N items
      return allData.slice(-Math.min(lastCycleCount, allData.length));
    } else {
      // Custom From - To dates
      return allData.filter((item) => {
        const [dStr, mStr, yStr] = item.timestamp.split(" ")[0].split(".");
        const dateObj = new Date(`${yStr}-${mStr}-${dStr}`);
        const fromDate = new Date(customFromDate);
        const toDate = new Date(customToDate);
        
        // Zero hours
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        return dateObj >= fromDate && dateObj <= toDate;
      });
    }
  };

  const activeReadings = getFilteredData();

  // Scroll to bottom of terminal console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [collectionLogs]);

  // Telemetry manual collection simulation - matching page 8 exactly!
  const triggerManualCollect = () => {
    setIsCollecting(true);
    setCollectionLogs([]);
    
    const targetStationName = selectedStation?.name || "IA BANG";
    const targetMeters = selectedStation?.meters || stations[0]?.meters || [];
    
    const logsList = [
      `[2021-09-11 21:53:56] [${targetStationName}] Gửi gói tin khơi động kết nối trạm tổng...`,
      `[2021-09-11 21:53:57] [172.20.37.105:2101] Đang mở luồng lập lịch TCP Socket...`,
      `[2021-09-11 21:53:58] [172.20.37.105:2101] Kết nối thành công! Giao tiếp rơ-le cascade độc lập.`
    ];

    let logIndex = 0;
    setCollectionLogs([logsList[0]]);

    const timer = setInterval(() => {
      logIndex++;
      if (logIndex < logsList.length) {
        setCollectionLogs((prev) => [...prev, logsList[logIndex]]);
      } else {
        // Now simulate reading and parsing all meters we have in the configuration!
        const meterIndex = Math.floor((logIndex - logsList.length) / 3);
        
        if (meterIndex < targetMeters.length) {
          const currentReadingMeter = targetMeters[meterIndex];
          const subStep = (logIndex - logsList.length) % 3;
          
          if (subStep === 0) {
            setCollectionLogs((prev) => [
              ...prev,
              `[2021-09-11 21:54:${12 + meterIndex * 2}] [172.20.37.105:2101] [${targetStationName}] [${currentReadingMeter.id}] Khởi tạo yêu cầu thiết bị...`
            ]);
          } else if (subStep === 1) {
            setCollectionLogs((prev) => [
              ...prev,
              `[2021-09-11 21:54:${12 + meterIndex * 2}] [172.20.37.105:2101] [${targetStationName}] [${currentReadingMeter.id}] Khởi động luồng đọc DLMS protocol.`
            ]);
          } else {
            setCollectionLogs((prev) => [
              ...prev,
              `[2021-09-11 21:54:${13 + meterIndex * 2}] [172.20.37.105:2101] [${targetStationName}] [${currentReadingMeter.id}] Đọc thành công! Các kênh đo: +A, -A, +R, -R`
            ]);
          }
        } else {
          // Completed
          clearInterval(timer);
          setCollectionLogs((prev) => [
            ...prev,
            `[2021-09-11 21:55:01] Disconnecting connection with 172.20.37.105:2101`,
            `[2021-09-11 21:55:02] [${targetStationName}] Giải phóng phiên kết nối trạm thành công.`,
            `02:20 FINISHED... Quá trình cập nhật dữ liệu diễn ra hoàn tất và lưu DB!`
          ]);
          setIsCollecting(false);
        }
      }
    }, 450);
  };

  const refreshDataset = () => {
    // Simulated Refresh delay
    const oldLogs = [...collectionLogs];
    setCollectionLogs((prev) => [...prev, "[SYS] Re-indexing timeseries database, cleaning cache..."]);
    setTimeout(() => {
      setCollectionLogs((prev) => [...prev, "[SYS] Tải và chuẩn hóa dữ liệu đồ thị thành công!"]);
    }, 300);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto bg-slate-50 font-sans">
      
      {/* Top Options Bar (replicates page 3 layout) */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-5 select-none shrink-0">
        
        {/* Left pane: Connections Scheduler parameters */}
        <div className="md:col-span-7 space-y-3.5 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-5">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <Settings className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cấu hình kênh thu thập</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  id="chk_auto_readout"
                  type="checkbox"
                  checked={automatic}
                  onChange={(e) => setAutomatic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">Tự động thu thập (Automatic)</span>
              </label>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 w-24">Chu kỳ thực hiện:</span>
                <input
                  id="num_exec_every"
                  type="number"
                  value={execEvery}
                  onChange={(e) => setExecEvery(parseInt(e.target.value, 10) || 1)}
                  className="w-14 px-2 py-0.5 bg-slate-50 border border-slate-300 text-center text-xs font-bold rounded"
                />
                <select
                  id="sel_exec_type"
                  value={execType}
                  onChange={(e) => setExecType(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded text-[11px] p-0.5"
                >
                  <option value="days">ngày (days)</option>
                  <option value="hours">giờ (hours)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Next start: <strong className="text-blue-700">12.09.2021 01:30</strong></span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 w-24">Quét dữ liệu của:</span>
                <input
                  id="num_for_last"
                  type="number"
                  value={forLast}
                  onChange={(e) => setForLast(parseInt(e.target.value, 10) || 1)}
                  className="w-14 px-2 py-0.5 bg-slate-50 border border-slate-300 text-center text-xs font-bold rounded"
                />
                <select
                  id="sel_for_last_type"
                  value={forLastType}
                  onChange={(e) => setForLastType(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded text-[11px] p-0.5"
                >
                  <option value="days">ngày (days)</option>
                  <option value="hours">giờ (hours)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex justify-between">
            <span>Last data: <strong className="text-slate-600">11.09.2021 16:00</strong></span>
            <span>Station Connection IP range: <strong className="text-slate-600 font-mono">172.20.37.105</strong></span>
          </div>
        </div>

        {/* Right pane: Action check list checkboxes & Manual trigger */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tham số quét</h4>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
            <label className="flex items-center gap-1.5 cursor-pointer py-0.5">
              <input
                id="chk_read_readout"
                type="checkbox"
                checked={readReadout}
                onChange={(e) => setReadReadout(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600"
              />
              <span>Read readout data</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer py-0.5">
              <input
                id="chk_read_profile"
                type="checkbox"
                checked={readLoadProfile}
                onChange={(e) => setReadLoadProfile(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600"
              />
              <span>Read load profile</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer py-0.5">
              <input
                id="chk_sync_time"
                type="checkbox"
                checked={syncTime}
                onChange={(e) => setSyncTime(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600"
              />
              <span>Synchronize time</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer py-0.5">
              <input
                id="chk_read_events"
                type="checkbox"
                checked={readEvents}
                onChange={(e) => setReadEvents(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600"
              />
              <span>Read events</span>
            </label>
          </div>

          <button
            id="btn_trigger_collect"
            onClick={triggerManualCollect}
            disabled={isCollecting}
            className={`w-full py-2 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white rounded text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-99 disabled:opacity-60 disabled:cursor-wait`}
          >
            <Play className={`w-3.5 h-3.5 ${isCollecting ? "animate-spin" : ""}`} />
            <span>{isCollecting ? "ĐANG THU THẬP SỐ LIỆU CÔNG TƠ..." : "BẮT ĐẦU ĐỌC MANUAL (COLLECT)"}</span>
          </button>
        </div>
      </div>

      {/* Terminal log panel (visible during and after collection session) */}
      {(collectionLogs.length > 0 || isCollecting) && (
        <div className="bg-slate-950 border border-slate-800 rounded p-4 font-mono text-xs text-slate-350 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 select-none">
            <span className="text-[10px] uppercase font-bold text-slate-520 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-450" />
              <span>Cửa sổ thiết lập đường truyền quét dữ liệu trực tiếp (Socket stream log)</span>
            </span>
            <button
              id="btn_clear_terminal"
              onClick={() => setCollectionLogs([])}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] leading-relaxed">
            {collectionLogs.map((log, idx) => {
              const isFinished = log.includes("FINISHED");
              const isError = log.includes("error") || log.includes("Disconnecting");
              return (
                <div
                  key={idx}
                  className={
                    isFinished
                      ? "text-emerald-400 font-bold text-xs pt-1 border-t border-slate-900 border-dashed"
                      : isError
                      ? "text-rose-400"
                      : "text-slate-300"
                  }
                >
                  {log}
                </div>
              );
            })}
            <div ref={consoleEndRef} />
          </div>
        </div>
      )}

      {/* Main visual panel layout: Left Chart & Right side Records Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 items-stretch">
        
        {/* Left Side: Custom Chart */}
        <div className="xl:col-span-8 flex flex-col h-[400px]">
          <InteractiveChart
            data={activeReadings}
            title={`${defaultMeter?.id || ""} - ${defaultChannel?.name || ""}`}
            unit={defaultChannel?.unit || "kWh"}
          />
        </div>

        {/* Right Side: Filters & Readings Data Table */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded p-4 shadow-xs flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0 select-none">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
              <ListFilter className="w-4 h-4 text-blue-600" />
              <span>Lọc chu kỳ theo dõi</span>
            </span>
            <button
              id="btn_apply_refresh"
              onClick={refreshDataset}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>Làm mới dữ liệu</span>
            </button>
          </div>

          {/* Quick Filters Group (mimicking page 9 filters: Today, Yesterday, Custom, Last) */}
          <div className="space-y-3 bg-slate-50 p-2.5 rounded border border-slate-200 shrink-0 select-none mb-3 text-xs">
            <div className="grid grid-cols-4 gap-1.5 font-semibold text-center">
              <button
                id="btn_filter_today"
                onClick={() => setFilterType("Today")}
                className={`py-1 rounded border text-[11px] cursor-pointer transition-colors ${
                  filterType === "Today" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-slate-100 border-slate-300"
                }`}
              >
                Today
              </button>
              <button
                id="btn_filter_yesterday"
                onClick={() => setFilterType("Yesterday")}
                className={`py-1 rounded border text-[11px] cursor-pointer transition-colors ${
                  filterType === "Yesterday" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-slate-100 border-slate-300"
                }`}
              >
                Yesterday
              </button>
              <button
                id="btn_filter_custom"
                onClick={() => setFilterType("Custom")}
                className={`py-1 rounded border text-[11px] cursor-pointer transition-colors ${
                  filterType === "Custom" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-slate-100 border-slate-300"
                }`}
              >
                Custom
              </button>
              <button
                id="btn_filter_last"
                onClick={() => setFilterType("Last")}
                className={`py-1 rounded border text-[11px] cursor-pointer transition-colors ${
                  filterType === "Last" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-slate-100 border-slate-300"
                }`}
              >
                Last
              </button>
            </div>

            {/* Filter Sub-configurations */}
            {filterType === "Custom" && (
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-200 border-dashed">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 font-semibold">Từ ngày (From):</span>
                  <input
                    id="input_from_date"
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className="px-1.5 py-1 bg-white border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 font-semibold">Tới ngày (To):</span>
                  <input
                    id="input_to_date"
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className="px-1.5 py-1 bg-white border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {filterType === "Last" && (
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200 border-dashed">
                <span className="text-slate-500 font-medium">Số lượng chu kỳ (Nửa giờ):</span>
                <div className="flex items-center gap-1.5">
                  <input
                    id="input_last_cycles"
                    type="number"
                    value={lastCycleCount}
                    onChange={(e) => setLastCycleCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-16 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center font-mono font-bold"
                  />
                  <span className="text-slate-400 font-mono">cycles</span>
                </div>
              </div>
            )}
          </div>

          {/* Table Data View mimicking pages 9 & 10 */}
          <div className="flex-1 overflow-y-auto border border-slate-250 rounded-sm bg-white min-h-[160px]">
            <table className="w-full text-left text-[11px] border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-250 font-bold text-slate-650 sticky top-0 z-10 select-none">
                  <th className="py-1.5 px-2">Timestamp</th>
                  <th className="py-1.5 px-2 text-right">RAW ({defaultChannel?.unit})</th>
                  <th className="py-1.5 px-2 text-right">CALC ({defaultChannel?.unit})</th>
                  <th className="py-1.5 px-1 text-center w-8">SRAW</th>
                  <th className="py-1.5 px-1 text-center w-8">SCL</th>
                </tr>
              </thead>
              <tbody>
                {activeReadings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-sans italic text-xs">
                      Không có dòng dữ liệu khớp điều kiện.
                    </td>
                  </tr>
                ) : (
                  [...activeReadings].reverse().map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-105 hover:bg-slate-50/80 transition-colors">
                      <td className="py-1.5 px-2 font-medium text-slate-700">{item.timestamp}</td>
                      <td className="py-1.5 px-2 text-right font-semibold text-slate-900">
                        {item.raw.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-blue-700">
                        {item.calc.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1 text-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
                      </td>
                      <td className="py-1.5 px-1 text-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-slate-400 mt-2 text-center select-none shrink-0 font-sans">
            Hiển thị <strong className="text-slate-600">{activeReadings.length}</strong> chu kỳ nạp lưu trữ.
          </div>
        </div>
      </div>

    </div>
  );
}
