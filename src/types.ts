/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChannelData {
  timestamp: string; // ISO or relative
  raw: number;       // Accumulated energy in kWh
  calc: number;      // Differential energy per cycle (30min) in kWh
  voltage?: number;   // phase voltage in V (about 220-230)
  current?: number;   // current in A (about 0 - 30)
  power?: number;     // power in kW
}

export interface MeterChannel {
  id: string; // e.g. "101_A+"
  name: string; // e.g. "+A (Điện năng tác dụng chiều giao)"
  unit: string; // e.g. "kWh" or "V" or "A"
  data: ChannelData[];
}

export interface MeterDevice {
  id: string; // e.g. "101"
  name: string; // e.g. "Điểm đo 101"
  channels: { [key: string]: MeterChannel };
}

export interface StationGroup {
  id: string; // e.g. "IA_BANG"
  name: string; // e.g. "IA BANG"
  meters: MeterDevice[];
}

export interface SystemService {
  name: string;
  description: string;
  executable: string;
  state: "running" | "stopped";
}

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  period: "Hour" | "Day" | "Week" | "Month";
  nextStart: string;
  lastExecution: string;
  executionTimeMs: number;
  active: boolean;
  executeForLast: number; // e.g. 2 days
  runDays: { [key: string]: boolean }; // e.g. Monday: true
  timeOfDay: string; // e.g. "02:00"
}

export interface LogMessage {
  timestamp: string;
  source: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}
