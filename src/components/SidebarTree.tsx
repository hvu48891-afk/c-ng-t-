/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Folder, FolderOpen, Zap, Radio, Search, ChevronDown, ChevronRight, Activity, Terminal } from "lucide-react";
import { StationGroup, MeterDevice, MeterChannel } from "../types";

interface SidebarTreeProps {
  stations: StationGroup[];
  selectedMeter: MeterDevice | null;
  selectedChannel: MeterChannel | null;
  onSelectMeter: (meter: MeterDevice) => void;
  onSelectChannel: (channel: MeterChannel, meter: MeterDevice) => void;
  onSelectStation: (station: StationGroup) => void;
  selectedStation: StationGroup | null;
  onOpenCollectLog: () => void;
}

export default function SidebarTree({
  stations,
  selectedMeter,
  selectedChannel,
  onSelectMeter,
  onSelectChannel,
  onSelectStation,
  selectedStation,
  onOpenCollectLog,
}: SidebarTreeProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stationsExpanded, setStationsExpanded] = useState(true);
  const [expandedMeters, setExpandedMeters] = useState<{ [key: string]: boolean }>({
    "101": true, // Default expanded for 101 as shown in screenshot page 6
  });

  const toggleMeter = (meterId: string) => {
    setExpandedMeters((prev) => ({
      ...prev,
      [meterId]: !prev[meterId],
    }));
  };

  const matchesSearch = (text: string) => {
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col h-full font-sans select-none shrink-0">
      {/* Search Header */}
      <div className="p-3 bg-slate-100 border-b border-slate-200">
        <div className="relative">
          <input
            id="sidebar_search_input"
            type="text"
            placeholder="Tìm kiếm công tơ, kênh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded text-xs focus:outline-hidden transition-colors"
          />
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Explorer Tree Title */}
      <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
        <span>Cấu trúc Trạm & Điểm Đo</span>
        <button 
          onClick={onOpenCollectLog}
          className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-105 transition-colors flex items-center gap-1 shrink-0"
          title="Xem log kết nối đọc trực tiếp"
        >
          <Terminal className="w-3 h-3 text-blue-600" />
          <span>Log đọc số liệu</span>
        </button>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 text-xs text-slate-700 space-y-1">
        {/* Stations Node Group */}
        <div className="space-y-0.5">
          <div
            id="node_stations_root"
            onClick={() => {
              if (stations[0]) onSelectStation(stations[0]);
            }}
            className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-200/60 rounded-sm cursor-pointer transition-colors ${
              selectedStation && !selectedMeter ? "bg-blue-50 text-blue-800 font-bold border-l-2 border-blue-600" : ""
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStationsExpanded(!stationsExpanded);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              {stationsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <Radio className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-semibold tracking-tight">STATIONS (Trạm tổng)</span>
          </div>

          {/* Stations Child Items */}
          {stationsExpanded && (
            <div className="pl-4 border-l border-slate-205 ml-3.5 space-y-0.5">
              {stations.map((station) => {
                // Check search filter
                const filteredMeters = station.meters.filter(
                  (m) =>
                    matchesSearch(m.id) ||
                    matchesSearch(m.name) ||
                    Object.values(m.channels).some((ch) => matchesSearch(ch.name) || matchesSearch(ch.id))
                );

                if (filteredMeters.length === 0 && station.name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
                  return null;
                }

                return (
                  <div key={station.id} className="space-y-0.5">
                    {/* Station Node e.g. IA BANG */}
                    <div
                      id={`node_station_${station.id}`}
                      onClick={() => onSelectStation(station)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-200/60 rounded-sm cursor-pointer transition-colors ${
                        selectedStation?.id === station.id && !selectedMeter
                          ? "bg-blue-50 text-blue-800 font-bold"
                          : ""
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-medium">{station.name}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1 py-0.2 rounded-full scale-90 ml-auto shrink-0">
                        {station.meters.length}
                      </span>
                    </div>

                    {/* Meters Child Items */}
                    <div className="pl-3 border-l border-slate-200 space-y-0.5">
                      {filteredMeters.map((meter) => {
                        const isExpanded = !!expandedMeters[meter.id];

                        return (
                          <div key={meter.id} className="space-y-0.5">
                            {/* Meter Point Node e.g. 101 */}
                            <div
                              id={`node_meter_${meter.id}`}
                              onClick={() => onSelectMeter(meter)}
                              className={`flex items-center gap-1.5 px-2 py-1 hover:bg-slate-200/60 rounded-sm cursor-pointer transition-colors ${
                                selectedMeter?.id === meter.id && !selectedChannel
                                  ? "bg-slate-200 text-slate-900 font-bold"
                                  : ""
                              }`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMeter(meter.id);
                                }}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                              <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0 animate-pulse" />
                              <span className="font-semibold text-slate-800">{meter.id}</span>
                              <span className="text-slate-500 text-[11px] truncate">({meter.name})</span>
                            </div>

                            {/* Channels list under Meter Point */}
                            {isExpanded && (
                              <div className="pl-5 border-l border-dashed border-slate-300 ml-2.5 space-y-0.5 bg-slate-100/50 py-0.5 rounded-sm">
                                {Object.values(meter.channels).map((channel) => {
                                  if (searchTerm && !matchesSearch(channel.name) && !matchesSearch(channel.id)) {
                                    return null;
                                  }

                                  const isSelected = selectedChannel?.id === channel.id;

                                  return (
                                    <div
                                      key={channel.id}
                                      id={`node_channel_${channel.id}`}
                                      onClick={() => onSelectChannel(channel, meter)}
                                      className={`flex items-center gap-1 px-1.5 py-1 hover:bg-slate-200 rounded-xs cursor-pointer transition-colors break-all whitespace-normal ${
                                        isSelected
                                          ? "bg-blue-600 text-white font-bold"
                                          : "text-slate-600 hover:text-slate-900"
                                      }`}
                                    >
                                      <Activity className={`w-3 h-3 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                                      <span className="truncate flex-1 text-[11px] leading-tight" title={channel.name}>
                                        {channel.id.replace(`${meter.id}_`, "")} ({channel.unit})
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
