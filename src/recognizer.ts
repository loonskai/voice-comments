import fs from 'fs';
import path from 'path';
import sox from 'sox-stream';
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
    this.filePath = path.resolve(__dirname, 'output');
    this.token = token;
    this.statusbar = statusbar;
    this.callback = callback;

    this.statusbar.Init();
  }

  start(): void {
    this.createMicInstance();
    if (this.micInstance && this.micInputStream) {
      this.micInstance.start()
      const outputFileStream = fs.createWriteStream(`${this.filePath}.raw`);
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

  private createMicInstance(): void {
    this.micInstance = mic({
      rate: 44100,
      channels: 1,
      fileType: 'raw',
      exitOnSilence: 6
    });
    this.micInputStream = this.micInstance.getAudioStream();
  }

  private createRevAiClient(): RevAiStreamingClient {
    const revAiClient = new RevAiStreamingClient(
      this.token,
      new AudioConfig('audio/x-wav', 'interleaved', 44100, 'S16LE', 1)
    );
    revAiClient.on('close', this.statusbar.Stopped);
    revAiClient.on('connectFailed', this.statusbar.Stopped);
    return revAiClient;
  }

  private processing(): void {
    let comment = '';
    this.statusbar.Processing();
    /* Format audio */
    const formatAudio = fs.createReadStream(`${this.filePath}.raw`)
      .pipe(sox({
        output: {
          bits: 16,
          rate: 44100,
          channels: 1,
          type: 'wav'
        }
      }))
      .pipe(fs.createWriteStream(`${this.filePath}.wav`));

    /* Broadcast to service */
    formatAudio.on('finish', () => {
      const revAiClient = this.createRevAiClient();
      const revAiStream = revAiClient.start();

      revAiStream.on('data', (data: StreamingHypothesis) => {
        if (data.type === 'final') {
          const result = data.elements.map(el => el.value).join('');
          comment = ['', '<unk>.'].includes(result) ? '' : result;
        }
      });

      const fileStream = fs.createReadStream(`${this.filePath}.wav`);

      fileStream.on('end', () => {
        revAiClient.end();
      });

      revAiStream.on('end', () => {
        this.callback(comment);
      });

      fileStream.pipe(revAiStream);
    });
  }
}
