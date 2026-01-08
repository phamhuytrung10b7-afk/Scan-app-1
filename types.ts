
export enum ScanStatus {
  VALID = 'VALID',
  DUPLICATE = 'DUPLICATE'
}

export interface ScanRecord {
  id: string;
  code: string;
  timestamp: string;
  status: ScanStatus;
  index: number;
}

export interface AppState {
  scans: ScanRecord[];
  lastScan: ScanRecord | null;
  error: string | null;
}
