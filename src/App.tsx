/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  initialStationsData, 
  initialServicesData, 
  initialSchedulesData, 
  defaultAutoReadoutConfig 
} from "./mockData";
import { StationGroup, MeterDevice, MeterChannel, SystemService, ScheduledTask } from "./types";
import LoginScreen from "./components/LoginScreen";
import HeaderBar from "./components/HeaderBar";
import SidebarTree from "./components/SidebarTree";
import FooterStatusBar from "./components/FooterStatusBar";
import DataCollectionModule from "./components/DataCollectionModule";
import DataViewerModule from "./components/DataViewerModule";
import ReportsModule from "./components/ReportsModule";
import DriversSettings from "./components/DriversSettings";
import SchedulesManager from "./components/SchedulesManager";
import { Radio, Database, HardDrive, Cpu, Calendar, Settings as Gear } from "lucide-react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("Supervisor");

  // State loaded from mock base
  const [stations, setStations] = useState<StationGroup[]>(initialStationsData);
  const [services, setServices] = useState<SystemService[]>(initialServicesData);
  const [schedules, setSchedules] = useState<ScheduledTask[]>(initialSchedulesData);

  // Layout selections
  const [selectedStation, setSelectedStation] = useState<StationGroup | null>(stations[0] || null);
  const [selectedMeter, setSelectedMeter] = useState<MeterDevice | null>(stations[0]?.meters[0] || null);
  const [selectedChannel, setSelectedChannel] = useState<MeterChannel | null>(stations[0]?.meters[0]?.channels["+A"] || null);

  // Tab control: "collection" (Data Collection), "viewer" (Data Viewer), "reports" (Reports)
  const [activeTab, setActiveTab] = useState<"collection" | "viewer" | "reports">("collection");

  // Tool Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSchedulesModal, setShowSchedulesModal] = useState(false);
  
  // Quick system notification triggers
  const [systemAlert, setSystemAlert] = useState("");

  const handleLoginSuccess = (user: string) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setSystemAlert("Chào mừng Supervisor quay trở lại hệ thống kết nối công tơ!");
    setTimeout(() => setSystemAlert(""), 4000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleSelectStation = (station: StationGroup) => {
    setSelectedStation(station);
    setSelectedMeter(null);
    setSelectedChannel(null);
  };

  const handleSelectMeter = (meter: MeterDevice) => {
    setSelectedMeter(meter);
    setSelectedStation(null);
    setSelectedChannel(null);
  };

  const handleSelectChannel = (channel: MeterChannel, meter: MeterDevice) => {
    setSelectedChannel(channel);
    setSelectedMeter(meter);
    setSelectedStation(null);
  };

  // Driver STATE change handler (Green/Red toggle from page 7)
  const handleToggleService = (sName: string, newState: "running" | "stopped") => {
    setServices((prev) =>
      prev.map((s) => (s.name === sName ? { ...s, state: newState } : s))
    );
    
    // Quick notification trigger
    setSystemAlert(`Dịch vụ driver [${sName}] đã ghi nhận trạng thái: ${newState.toUpperCase()}`);
    setTimeout(() => setSystemAlert(""), 3500);
  };

  const handleSaveSchedules = (updatedSchedules: ScheduledTask[]) => {
    setSchedules(updatedSchedules);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-black p-4">
        <div className="absolute top-10 text-center select-none">
          <div className="bg-red-600 text-white font-extrabold px-3.5 py-1.5 rounded italic tracking-tighter text-sm inline-block shadow-lg">
            TT-GROUP
          </div>
          <h1 className="text-white text-base md:text-lg font-bold tracking-tight uppercase mt-3">
            HỘI PHỤ TRỢ THU THẬP SỐ LIỆU CÔNG TƠ TỰ ĐỘNG
          </h1>
          <p className="text-slate-400 text-xs mt-1">Hệ điều hành tích hợp - Advance Economic Plus 1.14</p>
        </div>
        
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        
        <div className="absolute bottom-6 text-[11px] text-slate-500 font-mono text-center">
          Cơ sở hạ tầng cung cấp bởi TT-Group • Landis+Gyr License Certified
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden text-slate-800 font-sans">
      
      {/* Banner / Header Branding info (Logo, Hotline Fax, Mail) */}
      <HeaderBar />

      {/* Main Workstation Layout containing tree structure and tabs */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left pane: Stations & Device Tree Sidebar */}
        <SidebarTree
          stations={stations}
          selectedMeter={selectedMeter}
          selectedChannel={selectedChannel}
          onSelectMeter={handleSelectMeter}
          onSelectChannel={handleSelectChannel}
          onSelectStation={handleSelectStation}
          selectedStation={selectedStation}
          onOpenCollectLog={() => {
            setActiveTab("collection");
            // Set flag or trace inside module can be triggered via alerts
            setSystemAlert("Khởi động dòng log thu thập chu kỳ...");
            setTimeout(() => setSystemAlert(""), 2000);
          }}
        />

        {/* Center / Right Section Workspace pane containing Vùng 2 (Tabs) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
          
          {/* Main workspace Tab Selector (Vùng 2: Các module của phần mềm) */}
          <div className="h-10 bg-slate-205 border-b border-slate-300 flex items-center justify-between px-4 shrink-0 select-none bg-slate-100">
            <div className="flex items-center gap-1">
              <button
                id="btn_tab_collection"
                onClick={() => setActiveTab("collection")}
                className={`h-10 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  activeTab === "collection"
                    ? "bg-slate-50 text-blue-700 border-t-2 border-t-blue-600 border-x border-x-slate-300 font-black"
                    : "text-slate-650 hover:bg-slate-200/50"
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Thu thập số liệu (Data Collection)</span>
              </button>

              <button
                id="btn_tab_viewer"
                onClick={() => setActiveTab("viewer")}
                className={`h-10 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  activeTab === "viewer"
                    ? "bg-slate-50 text-blue-700 border-t-2 border-t-blue-600 border-x border-x-slate-300 font-black"
                    : "text-slate-650 hover:bg-slate-200/50"
                }`}
              >
                <Database className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Trình diễn số liệu (Data Viewer)</span>
              </button>

              <button
                id="btn_tab_reports"
                onClick={() => setActiveTab("reports")}
                className={`h-10 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  activeTab === "reports"
                    ? "bg-slate-50 text-blue-700 border-t-2 border-t-blue-600 border-x border-x-slate-300 font-black"
                    : "text-slate-650 hover:bg-slate-200/50"
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Báo cáo điện năng (Reports)</span>
              </button>
            </div>

            {/* Quick action buttons on tabs right side */}
            <div className="flex items-center gap-2">
              <button
                id="btn_tools_schedules"
                onClick={() => setShowSchedulesModal(true)}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Lịch trình tự động xuất dữ liệu cho A0"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Quản lý Lịch xuất (Schedules)</span>
              </button>

              <button
                id="btn_tools_services"
                onClick={() => setShowSettingsModal(true)}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Danh sách dịch vụ Drivers thu thập phát"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Trạng thái Driver (Service)</span>
              </button>
            </div>
          </div>

          {/* Active system-wide alert notices */}
          {systemAlert && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-2xl text-[11px] font-bold tracking-wide flex items-center gap-2 z-30 animate-bounce">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>{systemAlert}</span>
            </div>
          )}

          {/* Core Module View Renderer based on active tab select */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {activeTab === "collection" && (
              <DataCollectionModule
                stations={stations}
                selectedStation={selectedStation}
                selectedMeter={selectedMeter}
                selectedChannel={selectedChannel}
                onSelectMeter={handleSelectMeter}
                onSelectChannel={handleSelectChannel}
              />
            )}

            {activeTab === "viewer" && (
              <DataViewerModule
                stations={stations}
                selectedMeter={selectedMeter}
              />
            )}

            {activeTab === "reports" && (
              <ReportsModule
                stations={stations}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer status bar mimicking exact visual layout pages 4 & 5 */}
      <FooterStatusBar
        currentUser={currentUser}
        onLogout={handleLogout}
        openSettings={() => setShowSettingsModal(true)}
      />

      {/* Driver Settings Modal Dialog (Service state changes from page 7) */}
      {showSettingsModal && (
        <DriversSettings
          services={services}
          onToggleService={handleToggleService}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Schedules Manager Modal Dialog (Setup backups daily at 02h00 from page 15-16) */}
      {showSchedulesModal && (
        <SchedulesManager
          schedules={schedules}
          onSaveSchedules={handleSaveSchedules}
          onClose={() => setShowSchedulesModal(false)}
        />
      )}
    </div>
  );
}
