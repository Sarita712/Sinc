export enum AppMode {
  WELCOME = 'WELCOME',
  ACTIVE = 'ACTIVE',
}

export interface VibrationCommand {
  type: 'SIMPLE' | 'PATTERN' | 'STOP';
  duration?: number; // for simple
  pattern?: number[]; // for pattern
  name?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  peerId: string | null;
  lastMessage?: string;
}