import fs from 'fs';
import path from 'path';
import mic from 'mic';
import StatusBar from './statusbar';
import {
  AudioConfig,
  RevAiStreamingClient,
  StreamingHypothesis,
} from 'revai-node-sdk';

export default class Recognizer {
  filePath: string;
  token: string;
  micInstance: mic.MicInstance | undefined;
  micInputStream: mic.MicInputStream | undefined;

  revAiClient: RevAiStreamingClient | undefined;
  statusbar: typeof StatusBar;
  callback: (message: string) => void;

  constructor(token: string, statusbar: typeof StatusBar, callback: (message: string) => void) {
    this.filePath = path.resolve(__dirname, 'output.raw');
    this.token = token;
    this.statusbar = statusbar;
    this.callback = callback;

    this.statusbar.Init();
  }

  createMicInstance(): void {
    this.micInstance = mic({
      rate: 16000,
      channels: 1,
      device: 'plughw',
      fileType: 'raw',
      exitOnSilence: 6
    });
    this.micInputStream = this.micInstance.getAudioStream();
  }

  createRevAiClient(): RevAiStreamingClient {
    const revAiClient = new RevAiStreamingClient(
      this.token,
      new AudioConfig('audio/x-raw', 'interleaved', 16000, 'S16LE', 1)
    );
    revAiClient.on('close', this.statusbar.Stopped);
    revAiClient.on('connectFailed', this.statusbar.Stopped);
    return revAiClient;
  }

  start(): void {
    this.createMicInstance();
    if (this.micInstance && this.micInputStream) {
      this.micInstance.start()
      const outputFileStream = fs.createWriteStream(this.filePath);
      this.micInputStream.pipe(outputFileStream)

      this.statusbar.Recording();
      outputFileStream.on('finish', () => this.processing());
    }
  }

  stop(): void {
    if (this.micInstance) {
      this.micInstance.stop();
    }
  }
  
  processing(): void {
    let comment = '';
    this.statusbar.Processing();
    const revAiClient = this.createRevAiClient();
    const revAiStream = revAiClient.start();

    const file = fs.createReadStream(this.filePath);
    revAiStream.on('data', (data: StreamingHypothesis) => {
      if (data.type === 'final') {
        const result = data.elements.map(el => el.value).join('');
        comment = ['', '<unk>.'].includes(result) ? '' : result;
      }
    });

    file.on('end', () => {
      revAiClient.end();
    });

    revAiStream.on('end', () => {
      this.callback(comment);
    });
  
    file.pipe(revAiStream);
  }
}
