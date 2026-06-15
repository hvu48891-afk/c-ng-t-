/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, FileText, CheckCircle2, Download, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { StationGroup, MeterDevice } from "../types";

interface ReportsModuleProps {
  stations: StationGroup[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
}

export default function ReportsModule({ stations }: ReportsModuleProps) {
  const templates: ReportTemplate[] = [
    { id: "1", name: "Báo cáo sản lượng đo đếm hàng ngày", description: "Báo cáo mặc định kết xuất 48 chu kỳ sản lượng theo ngày gửi điều độ A0", type: "Regular" },
    { id: "2", name: "Báo cáo bổ sung sản lượng bổ khuyết ngày", description: "Báo cáo phụ trợ điền khuyết số liệu bù trừ mất điện chu kỳ ngày D-1", type: "Supplementary" },
    { id: "170", name: "Báo cáo mẫu thông số vận hành (U, I, Pmax)", description: "Bảng tổng hợp tham số dòng điện, điện áp trung bình và công suất đỉnh", type: "Operation" },
  ];

  const [selectedTemplateId, setSelectedTemplateId] = useState("1");
  const [reportFormat, setReportFormat] = useState("EXCEL");
  const [fromDate, setFromDate] = useState("2021-09-10");
  const [toDate, setToDate] = useState("2021-09-11");
  const [selectedMeters, setSelectedMeters] = useState<string[]>(["101", "102"]);
  
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState("");

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const allMeters = stations.flatMap((s) => s.meters);

  const handleToggleMeter = (id: string) => {
    if (selectedMeters.includes(id)) {
      setSelectedMeters(selectedMeters.filter((mId) => mId !== id));
    } else {
      setSelectedMeters([...selectedMeters, id]);
    }
  };

  const handleBuildReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeters.length === 0) {
      alert("Vui lòng tích chọn ít nhất 1 thiết bị công tơ áp dụng xuất!");
      return;
    }

    setIsExporting(true);
    setNotification("");

    setTimeout(() => {
      // Build structured report report file downloads
      let reportText = "";
      reportText += `=========================================================================\n`;
      reportText += `                   BAO CAO KET XUAT TU DONG - ADVANCE ECONOMIC           \n`;
      reportText += `=========================================================================\n`;
      reportText += `Ten mau bao cao dac thu: ${activeTemplate.name}\n`;
      reportText += `Loai dinh danh template: ID ${activeTemplate.id} (Kieu: ${activeTemplate.type})\n`;
      reportText += `Khung thoi gian truy van: Tu ${fromDate} den ${toDate}\n`;
      reportText += `Dinh dang kieu file xuat ra: ${reportFormat}\n`;
      reportText += `Thoi gian thuc hien bao cao: Sun Sep 12 02:40:02 ICT 2021\n`;
      reportText += `=========================================================================\n\n`;

      selectedMeters.forEach((mId) => {
        const m = allMeters.find((meter) => meter.id === mId);
        if (!m) return;
        reportText += `>>> THIET BI DIEM DO: ${m.id} (${m.name}) <<<\n`;
        reportText += `-------------------------------------------------------------------------\n`;
        reportText += `Timestamp            | Raw Accumulated (kWh) | differential CALC (kWh) | Status\n`;
        reportText += `-------------------------------------------------------------------------\n`;
        
        // Mocking subset rows
        const ch = m.channels["+A"] || Object.values(m.channels)[0];
        if (ch && ch.data) {
          ch.data.slice(0, 15).forEach((row) => {
            reportText += `${row.timestamp.padEnd(20)} | ${row.raw.toFixed(2).padEnd(21)} | ${row.calc.toFixed(2).padEnd(23)} | VALID\n`;
          });
        }
        reportText += `-------------------------------------------------------------------------\n\n`;
      });

      reportText += `[SIGN] Ky boi: Supervisor (He thong thu thap cong to tu dong TT-GROUP)\n`;

      // Trigger file download matching type
      const downloadExt = reportFormat === "EXCEL" ? "xls" : reportFormat.toLowerCase();
      const filename = `Report_${activeTemplate.name.replace(/\s+/g, "_")}_${fromDate}_${toDate}.${downloadExt}`;

      const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setNotification(`Kết xuất báo cáo file [${filename}] thành công!`);
      setTimeout(() => setNotification(""), 4500);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full font-sans select-none overflow-hidden bg-slate-50">
      
      {/* Left panel templates lists */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-205 bg-white p-4 flex flex-col gap-3.5 shrink-0 overflow-y-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chọn mẫu báo cáo (Excel/File)</span>
        
        <div className="space-y-2 mt-1">
          {templates.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`p-3 border rounded-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-slate-100 border-slate-400 text-slate-900 shadow-xs"
                    : "hover:bg-slate-50 border-slate-200 text-slate-650"
                }`}
              >
                <div className="flex justify-between font-bold text-xs">
                  <span className="truncate">{tpl.name}</span>
                  <span className="font-mono text-blue-700 bg-blue-50 border border-blue-100 px-1 rounded text-[9px] scale-90">ID {tpl.id}</span>
                </div>
                <p className="text-[10px] text-slate-450 mt-1 line-clamp-2 leading-relaxed font-semibold">
                  {tpl.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right details editor & parameters screen matching page 14 */}
      <form 
        onSubmit={handleBuildReport}
        className="flex-1 p-5 space-y-4 overflow-y-auto max-w-[1000px] mx-auto flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded p-4 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Template general specs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Thông tin tiêu chuẩn mẫu</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-24">Template ID:</span>
                  <input
                    type="text"
                    value={activeTemplate.id}
                    disabled
                    className="w-16 bg-slate-55 border border-slate-300 text-center text-xs font-mono font-bold rounded p-1"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">Template name:</span>
                  <input
                    type="text"
                    value={activeTemplate.name}
                    disabled
                    className="bg-slate-50 border border-slate-250 rounded text-xs p-1.5 text-slate-700 font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">Description:</span>
                  <textarea
                    value={activeTemplate.description}
                    disabled
                    className="bg-slate-50 border border-slate-250 rounded text-[11px] p-2 h-14 text-slate-500 font-medium resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* General parameters and setups */}
            <div className="space-y-3 md:border-l md:border-slate-200 md:pl-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                On execution / Setup tùy chọn
              </h4>

              <div className="space-y-2 text-xs font-semibold text-slate-650">
                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  <span>Insert rows/columns automatically</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                  <span>Ignore data status checking codes</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  <span>Execute dynamically (IA BANG Cascade)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                  <span>Export single Excel sheet layout</span>
                </label>
              </div>
            </div>
          </div>

          {/* Time pickers and formats */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Start / End Time frame */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                Thời gian xuất dữ liệu (From - To)
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-semibold text-[11px]">Bắt đầu (From):</span>
                  <input
                    id="rpt_from_date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-white border border-slate-350 p-1.5 rounded select-text focus:border-blue-500 font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-semibold text-[11px]">Kết thúc (To):</span>
                  <input
                    id="rpt_to_date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-white border border-slate-350 p-1.5 rounded select-text focus:border-blue-500 font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Target Export Formats selection */}
            <div className="space-y-3.5 md:border-l md:border-slate-200 md:pl-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                Định dạng kết xuất tệp tin
              </h4>

              <div className="flex flex-col gap-1">
                <span className="text-slate-400 text-xs font-semibold">Chọn kiểu tệp tài liệu:</span>
                <select
                  id="rpt_select_format"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="bg-white border border-slate-350 p-2 rounded text-xs font-bold focus:border-blue-500 cursor-pointer w-full"
                >
                  <option value="EXCEL">EXCEL (Báo cáo đầy đủ dạng bảng *.xls)</option>
                  <option value="CSV">CSV (Ngăn dòng bằng dấu phẩy *.csv)</option>
                  <option value="PDF">PDF (Tài liệu in ấn di động *.pdf)</option>
                  <option value="TXT">TXT (Tệp tin văn bản thuần túy *.txt)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Device multiselector layout mimicking page 14 */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
              Áp dụng cho các điểm đo (List of devices for template execution)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {allMeters.map((m) => {
                const isSelected = selectedMeters.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2 border p-2 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-slate-100 border-slate-400 text-slate-900 font-bold"
                        : "hover:bg-slate-50 border-slate-200 text-slate-650"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleMeter(m.id)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-350"
                    />
                    <span>{m.id} - {m.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Export triggers section */}
        <div className="bg-slate-100 border border-slate-250 rounded p-4 mt-4 space-y-3 shrink-0">
          {notification && (
            <div className="bg-emerald-50 text-emerald-800 text-xs py-2 px-3 border border-emerald-200 rounded flex gap-1.5 items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{notification}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-450 font-semibold max-w-sm">
              * Dữ liệu xuất ra sẽ gồm chỉ số tích lũy (RAW) và sản lượng hiệu số chu kỳ (CALC) của các điểm đo được tích chọn.
            </span>
            <button
              id="btn_confirm_export"
              type="submit"
              disabled={isExporting}
              className="px-8 py-2 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded-sm text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span>{isExporting ? "ĐANG TỔNG HỢP KIỂM TRA..." : "XUẤT BÁO CÁO (EXPORT)"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
