/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { LineChart, BarChart2, AreaChart, Table, Download, RefreshCw, Layers, CheckCircle2 } from "lucide-react";
import { StationGroup, MeterDevice, MeterChannel } from "../types";
import InteractiveChart from "./InteractiveChart";

interface DataViewerModuleProps {
  stations: StationGroup[];
  selectedMeter: MeterDevice | null;
}

export default function DataViewerModule({ stations, selectedMeter }: DataViewerModuleProps) {
  // Config parameters
  const [selectedMetersList, setSelectedMetersList] = useState<string[]>(["101"]);
  const [activeDataType, setActiveDataType] = useState<"RAW" | "CALC" | "Power">("CALC");
  const [chartType, setChartType] = useState<"Line" | "Bar" | "Area" | "Table">("Line");
  const [timeStep, setTimeStep] = useState("30m");

  const [notification, setNotification] = useState("");
  const [showExportMenu, setShowExportMenu] = useState<{ x: number; y: number } | null>(null);

  const activeMeterId = selectedMetersList[0] || "101";
  const allMeters = stations.flatMap((s) => s.meters);
  const activeMeter = allMeters.find((m) => m.id === activeMeterId) || allMeters[0];
  
  // Channels available for active meter
  const channelKeys = Object.keys(activeMeter?.channels || {});
  const [activeChannelKey, setActiveChannelKey] = useState<string>("+A");
  
  const activeChannel = activeMeter?.channels[activeChannelKey] || activeMeter?.channels["+A"];
  const displayData = activeChannel?.data || [];

  const handleToggleMeter = (meterId: string) => {
    if (selectedMetersList.includes(meterId)) {
      if (selectedMetersList.length > 1) {
        setSelectedMetersList(selectedMetersList.filter((id) => id !== meterId));
      }
    } else {
      setSelectedMetersList([...selectedMetersList, meterId]);
    }
  };

  const handleExportCSV = () => {
    if (!activeChannel) return;

    // Build standard CSV file output representing meter readings table
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "PHÂN MỀM ADVANCE ECONOMIC PLUS - BAO CAO SO LIEU CONG TO\n";
    csvContent += `Diem do: ${activeMeterId} (${activeMeter.name}), Kenh do: ${activeChannel.name}\n`;
    csvContent += `Don vi tinh: ${activeChannel.unit}, Chu ky: 30 phut\n\n`;
    csvContent += "Timestamp,RAW (Chi so tich luy),CALC (San luong differential),P (kW),U pha A (V),I pha A (A)\n";

    displayData.forEach((row) => {
      csvContent += `"${row.timestamp}",${row.raw},${row.calc},${row.power || 0},${row.voltage || 220},${row.current || 5}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AMR_Export_Meter_${activeMeterId}_Channel_${activeChannelKey}_20210911.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Prompt notify
    setNotification("Kết xuất bảng dữ liệu sang Excel thành công!");
    setTimeout(() => setNotification(""), 3000);
    setShowExportMenu(null);
  };

  const handleTableRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowExportMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full font-sans select-none overflow-hidden bg-slate-50">
      
      {/* Left panel options: Selector of channels and visual formats */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-4 flex flex-col gap-4.5 shrink-0 overflow-y-auto">
        
        {/* Step 1: Select Meter Point */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bước 1: Chọn điểm đo</span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-205 p-2 rounded-sm bg-slate-50">
            {allMeters.map((meter) => (
              <label
                key={meter.id}
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors text-xs ${
                  selectedMetersList.includes(meter.id) ? "bg-blue-50 text-blue-800 font-bold" : "hover:bg-white text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMetersList.includes(meter.id)}
                  onChange={() => handleToggleMeter(meter.id)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                />
                <span>{meter.id} ({meter.name.replace("Điểm đo ", "")})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Step 2: Select Channel Type */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bước 2: Chọn kênh đo hiển thị</span>
          <div className="space-y-1 max-h-44 overflow-y-auto border border-slate-205 p-1.5 rounded-sm bg-slate-50 text-xs">
            {channelKeys.map((chKey) => {
              const ch = activeMeter?.channels[chKey];
              if (!ch) return null;
              const isSelected = activeChannelKey === chKey;
              return (
                <button
                  key={chKey}
                  onClick={() => setActiveChannelKey(chKey)}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-colors ${
                    isSelected ? "bg-blue-600 text-white font-bold" : "hover:bg-white text-slate-600"
                  }`}
                >
                  <div className="font-semibold">{chKey} ({ch.unit})</div>
                  <div className={`text-[10px] truncate ${isSelected ? "text-blue-100" : "text-slate-400"}`}>{ch.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Select Parameter values type */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bước 3: Đại lượng hiển thị</span>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded text-center text-xs font-semibold">
            <button
              onClick={() => setActiveDataType("RAW")}
              className={`py-1 rounded cursor-pointer transition-colors ${
                activeDataType === "RAW" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              RAW
            </button>
            <button
              onClick={() => setActiveDataType("CALC")}
              className={`py-1 rounded cursor-pointer transition-colors ${
                activeDataType === "CALC" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              CALC
            </button>
            <button
              onClick={() => setActiveDataType("Power")}
              className={`py-1 rounded cursor-pointer transition-colors ${
                activeDataType === "Power" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Công suất
            </button>
          </div>
        </div>

        {/* Step 4: Time resolution step */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bước 4: Độ phân giải chu kỳ</span>
          <select
            id="view_time_step_select"
            value={timeStep}
            onChange={(e) => setTimeStep(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer"
          >
            <option value="30m">Mặc định (30 phút / chu kỳ tích phân)</option>
            <option value="1h">Khái quát (1 giờ)</option>
            <option value="1d">Tổng hợp (1 ngày)</option>
          </select>
        </div>
      </div>

      {/* Main workspace visual diagram and table pane */}
      <div 
        onClick={() => setShowExportMenu(null)}
        className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto"
      >
        {/* Top Control Bar with chart format tabs */}
        <div className="bg-white border border-slate-205 rounded p-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 select-none">
          
          {/* Format switches: Line, Bar, Area or Table */}
          <div className="flex bg-slate-100 p-1 rounded gap-1 shrink-0 text-xs font-semibold">
            <button
              id="btn_chart_line"
              onClick={() => setChartType("Line")}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-all ${
                chartType === "Line" ? "bg-white text-blue-700 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Dạng Sợi (Line)</span>
            </button>
            <button
              id="btn_chart_bar"
              onClick={() => setChartType("Bar")}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-all ${
                chartType === "Bar" ? "bg-white text-blue-700 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Dạng Cột (Bar)</span>
            </button>
            <button
              id="btn_chart_area"
              onClick={() => setChartType("Area")}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-all ${
                chartType === "Area" ? "bg-white text-blue-700 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <AreaChart className="w-3.5 h-3.5" />
              <span>Dạng Vùng (Area)</span>
            </button>
            <button
              id="btn_chart_table"
              onClick={() => setChartType("Table")}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-all ${
                chartType === "Table" ? "bg-white text-blue-700 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Dạng Bảng (Table)</span>
            </button>
          </div>

          {/* Action Triggers: Export layout spreadsheet */}
          <div className="flex items-center gap-2">
            <button
              id="btn_view_refresh"
              className="p-1.8 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs select-none flex items-center gap-1 transition-colors"
              title="Làm mới biểu đồ"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              id="btn_export_excel"
              onClick={handleExportCSV}
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white border border-transparent shadow-xs rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel / Export CSV</span>
            </button>
          </div>
        </div>

        {/* Global state trigger notifications */}
        {notification && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs py-2 px-3 rounded flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{notification}</span>
          </div>
        )}

        {/* Major Visual Frame Plot area */}
        <div className="h-[450px] flex flex-col shrink-0">
          {chartType !== "Table" ? (
            <InteractiveChart
              data={displayData}
              title={`${activeMeterId} • Kênh: ${activeChannelKey} (${activeChannel?.name || ""}) • Kiểu biểu diễn: ${chartType}`}
              unit={activeChannel?.unit || "kWh"}
              isPowerView={activeDataType === "Power"}
            />
          ) : (
            <div 
              onContextMenu={handleTableRightClick}
              className="flex-1 bg-white border border-slate-205 rounded shadow-xs p-3 overflow-y-auto select-text relative"
            >
              <div className="text-slate-400 text-[10px] mb-2 border-b border-dashed pb-1 text-right select-none font-semibold">
                * Click chuột phải vào bảng mẫu để mở nhanh menu "Export to Excel"
              </div>
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-600 sticky top-0 z-10">
                    <th className="py-2 px-3">Thời gian (Timestamp)</th>
                    <th className="py-2 px-3">Điểm đo (Meter)</th>
                    <th className="py-2 px-3 text-right">RAW ({activeChannel?.unit})</th>
                    <th className="py-2 px-3 text-right">CALC ({activeChannel?.unit})</th>
                    <th className="py-2 px-3 text-right">Độ lệch (%)</th>
                    <th className="py-2 px-4 text-center">Trạng thái (SCALC)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 text-slate-705 font-medium">{row.timestamp}</td>
                      <td className="py-2 px-3 text-slate-500 font-bold">{activeMeterId}</td>
                      <td className="py-2 px-3 text-right text-slate-900">
                        {row.raw.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700">
                        {row.calc.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">
                        {(0.05 + (row.calc % 0.1)).toFixed(2)}%
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.2 select-none font-bold text-[10px]">
                          VALID
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Replicating context menu page 13 */}
      {showExportMenu && (
        <div
          id="export_context_menu"
          className="fixed bg-white border border-slate-320 rounded shadow-2xl py-1 w-48 text-xs font-semibold text-slate-700 z-50 pointer-events-auto"
          style={{ left: showExportMenu.x, top: showExportMenu.y }}
        >
          <button
            onClick={() => {
              // Copy table row text clipboard simulation
              setNotification("Đã sao chép (Copy) bảng trích xuất dữ liệu!");
              setTimeout(() => setNotification(""), 3000);
              setShowExportMenu(null);
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center justify-between"
          >
            <span>Copy selected rows</span>
            <span className="text-[10px] text-slate-400 font-normal">Ctrl+C</span>
          </button>
          <button
            id="btn_export_excel_ctx"
            onClick={handleExportCSV}
            className="w-full text-left px-3.5 py-2 hover:bg-slate-100 text-blue-750 font-bold flex items-center justify-between"
          >
            <span>Export to Excel</span>
            <span className="text-[10px] text-blue-500 font-normal">Alt+E</span>
          </button>
          <div className="border-t border-slate-150 my-1"></div>
          <button
            className="w-full text-left px-3.5 py-2 text-slate-400 cursor-not-allowed"
            disabled
          >
            Show Legend details
          </button>
        </div>
      )}

    </div>
  );
}
