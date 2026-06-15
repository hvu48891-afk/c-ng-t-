/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StationGroup, SystemService, ScheduledTask, ChannelData } from "./types";

// Helper to generate dates around Sept 9th to 11th, 2021 to match PDF exactly, plus dynamic up to today
export function generateTimeseries(
  meterId: string,
  channelType: string,
  daysCount = 4
): ChannelData[] {
  const data: ChannelData[] = [];
  
  // Custom seed per meter
  const seedMultiplier = parseInt(meterId, 10) || 100;
  let currentRaw = 370000.0 + seedMultiplier * 35.15; // Realistic absolute value in kWh

  // Let's generate reading intervals. A cycle is 30 minutes (48 per day)
  const baseDate = new Date("2021-09-08T00:00:00");
  const totalCycles = daysCount * 48;

  for (let i = 0; i < totalCycles; i++) {
    const cycleTime = new Date(baseDate.getTime() + i * 30 * 60 * 1000);
    const hour = cycleTime.getHours();
    
    // Day consumption shape: peak during afternoon, lower at late night
    const timeFactor = (hour >= 9 && hour <= 17) ? 1.8 : (hour >= 23 || hour <= 5) ? 0.4 : 1.0;
    const randomLoad = 1.5 + Math.sin((hour / 24) * Math.PI * 2) * 0.8 + Math.random() * 0.5;
    
    let calc = Number((randomLoad * timeFactor * (1 + (parseInt(meterId, 10) % 5) * 0.1)).toFixed(2));
    if (channelType.endsWith("-") || channelType.includes("R")) {
      // Import/reactive are smaller
      calc = Number((calc * 0.15).toFixed(2));
    }

    currentRaw += calc;
    currentRaw = Number(currentRaw.toFixed(2));

    // Voltage around 220V
    const voltage = Number((220 + Math.sin(i / 10) * 3 + Math.random() * 1.5).toFixed(1));
    // Current in Amperes
    const current = Number((5 + (calc * 1.8) + Math.random() * 0.5).toFixed(2));
    // Power in kW
    const power = Number((voltage * current * 0.85 / 1000).toFixed(2));

    // Format timestamp string "DD.MM.YYYY HH:MM" matching PDF screenshots
    const dayStr = String(cycleTime.getDate()).padStart(2, "0");
    const mStr = String(cycleTime.getMonth() + 1).padStart(2, "0");
    const yStr = cycleTime.getFullYear();
    const hStr = String(cycleTime.getHours()).padStart(2, "0");
    const minStr = String(cycleTime.getMinutes()).padStart(2, "0");
    const formattedTimestamp = `${dayStr}.${mStr}.${yStr} ${hStr}:${minStr}`;

    data.push({
      timestamp: formattedTimestamp,
      raw: currentRaw,
      calc: calc,
      voltage: voltage,
      current: current,
      power: power,
    });
  }

  return data;
}

export const initialStationsData: StationGroup[] = [
  {
    id: "IA_BANG",
    name: "IA BANG",
    meters: [
      {
        id: "101",
        name: "Điểm đo 101",
        channels: {
          "+A": { id: "101_A+", name: "+A (Điện năng điện tử chiều giao)", unit: "kWh", data: generateTimeseries("101", "+A") },
          "-A": { id: "101_A-", name: "-A (Điện năng điện tử chiều nhận)", unit: "kWh", data: generateTimeseries("101", "-A") },
          "+R": { id: "101_R+", name: "+R (Điện năng phản kháng chiều giao)", unit: "kVarh", data: generateTimeseries("101", "+R") },
          "-R": { id: "101_R-", name: "-R (Điện năng phản kháng chiều nhận)", unit: "kVarh", data: generateTimeseries("101", "-R") },
          "V_L1": { id: "101_V_L1", name: "Điện áp pha A (V_L1)", unit: "V", data: generateTimeseries("101", "V_L1") },
          "Current_L1": { id: "101_Current_L1", name: "Dòng điện pha A (Current_L1)", unit: "A", data: generateTimeseries("101", "Current_L1") },
          "Pmax_T1": { id: "101_Pmax_T1", name: "Công suất cực đại T1 (Pmax_T1)", unit: "kW", data: generateTimeseries("101", "Pmax_T1") },
        }
      },
      {
        id: "102",
        name: "Điểm đo 102",
        channels: {
          "+A": { id: "102_A+", name: "+A (Điện năng điện tử chiều giao)", unit: "kWh", data: generateTimeseries("102", "+A") },
          "-A": { id: "102_A-", name: "-A (Điện năng điện tử chiều nhận)", unit: "kWh", data: generateTimeseries("102", "-A") },
          "+R": { id: "102_R+", name: "+R (Điện năng phản kháng chiều giao)", unit: "kVarh", data: generateTimeseries("102", "+R") },
          "-R": { id: "102_R-", name: "-R (Điện năng phản kháng chiều nhận)", unit: "kVarh", data: generateTimeseries("102", "-R") },
          "V_L1": { id: "102_V_L1", name: "Điện áp pha A (V_L1)", unit: "V", data: generateTimeseries("102", "V_L1") },
          "Current_L1": { id: "102_Current_L1", name: "Dòng điện pha A (Current_L1)", unit: "A", data: generateTimeseries("102", "Current_L1") },
          "Pmax_T1": { id: "102_Pmax_T1", name: "Công suất cực đại T1 (Pmax_T1)", unit: "kW", data: generateTimeseries("102", "Pmax_T1") },
        }
      },
      {
        id: "301",
        name: "Điểm đo 301",
        channels: {
          "+A": { id: "301_A+", name: "+A (Điện năng điện tử chiều giao)", unit: "kWh", data: generateTimeseries("301", "+A") },
          "-A": { id: "301_A-", name: "-A (Điện năng điện tử chiều nhận)", unit: "kWh", data: generateTimeseries("301", "-A") },
        }
      },
      {
        id: "302",
        name: "Điểm đo 302",
        channels: {
          "+A": { id: "302_A+", name: "+A (Điện năng điện tử chiều giao)", unit: "kWh", data: generateTimeseries("302", "+A") },
          "-A": { id: "302_A-", name: "-A (Điện năng điện tử chiều nhận)", unit: "kWh", data: generateTimeseries("302", "-A") },
        }
      },
      {
        id: "303",
        name: "Điểm đo 303",
        channels: {
          "+A": { id: "303_A+", name: "+A (Điện năng điện tử chiều giao)", unit: "kWh", data: generateTimeseries("303", "+A") },
          "-A": { id: "303_A-", name: "-A (Điện năng điện tử chiều nhận)", unit: "kWh", data: generateTimeseries("303", "-A") },
        }
      },
      {
        id: "304",
        name: "Điểm đo 304",
        channels: {
          "+A": { id: "304_A+", name: "+A (Điện năng điện tử chiều giao)", unit: "kWh", data: generateTimeseries("304", "+A") },
          "-A": { id: "304_A-", name: "-A (Điện năng điện tử chiều nhận)", unit: "kWh", data: generateTimeseries("304", "-A") },
        }
      },
      {
        id: "305",
        name: "Điểm đo 305",
        channels: {
          "+A": { id: "305_A+", name: "+A (Điện năng điện tử chiều giao)", unit: "kWh", data: generateTimeseries("305", "+A") },
          "-A": { id: "305_A-", name: "-A (Điện năng điện tử chiều nhận)", unit: "kWh", data: generateTimeseries("305", "-A") },
        }
      },
    ]
  }
];

export const initialServicesData: SystemService[] = [
  { name: "EasyDataReader_Calculation", description: "EasyData Reader Calculation Service", executable: "EasyDataReader_Calculation.exe", state: "running" },
  { name: "EasyDataReader_DLMS", description: "Easy Data Reader for DLMS Protocol", executable: "EasyDataReader_DLMS.exe", state: "running" },
  { name: "EasyDataReader_IEC1107", description: "Easy Data Reader for IEC1107 Protocol", executable: "EasyDataReader_IEC1107.exe", state: "stopped" }, // One stopped to let user test starting it (page 7)
  { name: "EasyDataReader_FIMP", description: "EasyDataReader_FIMP.exe service", executable: "EasyDataReader_FIMP.exe", state: "running" },
  { name: "EasyDataReader_KING", description: "EasyDataReader_KING.exe service", executable: "EasyDataReader_KING.exe", state: "running" },
  { name: "EasyDataReader_MBUS", description: "EasyDataReader_MBUS.exe service", executable: "EasyDataReader_MBUS.exe", state: "running" },
  { name: "EasyDataReader_PLC-FIN", description: "EasyDataReader_PLC-FIN.exe Service", executable: "EasyDataReader_PLC-FIN.exe", state: "running" },
  { name: "EasyDataReader_PLC-IE", description: "EasyDataReader_PLC-IE.exe Service", executable: "EasyDataReader_PLC-IE.exe", state: "running" },
];

export const initialSchedulesData: ScheduledTask[] = [
  {
    id: "sched_01",
    name: "IA BANG",
    description: "Executes Excel report automatically for IA BANG station",
    period: "Day",
    nextStart: "12.09.2021 02:00",
    lastExecution: "11.09.2021 02:00:03",
    executionTimeMs: 3593,
    active: true,
    executeForLast: 2,
    timeOfDay: "02:00",
    runDays: {
      "Monday": true,
      "Tuesday": true,
      "Wednesday": true,
      "Thursday": true,
      "Friday": true,
      "Saturday": false,
      "Sunday": false
    }
  }
];

export const defaultAutoReadoutConfig = {
  enabled: true,
  intervalCount: 1,
  intervalType: "days", // days / hours
  readForLastCount: 1,
  readForLastType: "days",
  lastDateConnection: "11.09.2021 18:00",
  readReadoutData: true,
  readLoadProfileData: true,
  synchronizeTime: false,
  readEvents: true,
};
