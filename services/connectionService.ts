import { VibrationCommand } from '../types';

/**
 * In a real-world scenario, this service would implement WebRTC (via PeerJS) or WebSockets.
 * For this demo environment without a custom backend, we use BroadcastChannel.
 * This allows two tabs in the same browser to communicate effectively "connecting" them.
 */

const CHANNEL_NAME = 'vibesync_demo_channel';

class ConnectionService {
  private channel: BroadcastChannel;
  private onMessageCallback: ((cmd: VibrationCommand) => void) | null = null;

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.channel.onmessage = (event) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(event.data as VibrationCommand);
      }
    };
  }

  public sendCommand(command: VibrationCommand) {
    this.channel.postMessage(command);
  }

  public onMessage(callback: (cmd: VibrationCommand) => void) {
    this.onMessageCallback = callback;
  }

  public close() {
    this.channel.close();
  }
}

export const connectionService = new ConnectionService();
