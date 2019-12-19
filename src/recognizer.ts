import fs from 'fs';
import path from 'path';
import mic from 'mic';
import StatusBar from './statusbar';
import {
  AudioConfig,
  RevAiStreamingClient,
  StreamingHypothesis,
} from 'revai-node-sdk';
import { Duplex } from 'stream';

export default class Recognizer {
  filePath: string;
  micInstance: mic.MicInstance | undefined;
  micInputStream: mic.MicInputStream | undefined;

  revAiClient: RevAiStreamingClient;
  statusbar: typeof StatusBar;
  callback: (message: string) => void;

  constructor(token: string, statusbar: typeof StatusBar, callback: (message: string) => void) {
    this.filePath = path.resolve(__dirname, 'output.raw');
    this.statusbar = statusbar;
    this.callback = callback;
    this.revAiClient = new RevAiStreamingClient(
      token,
      new AudioConfig('audio/x-raw', 'interleaved', 16000, 'S16LE', 1)
    );
    this.statusbar.Init();
  }

  createMicInstance(): void {
    this.micInstance = mic({
      rate: 16000,
      channels: 1,
      device: 'plughw',
      fileType: 'raw',
      debug: true,
      exitOnSilence: 6
    });
    this.micInputStream = this.micInstance.getAudioStream();
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
    try {
      this.statusbar.Processing();
      const revAiStream = this.revAiClient.start();

      const file = fs.createReadStream(this.filePath);
      revAiStream.on('data', (data: StreamingHypothesis) => {
        if (data.type === 'final') {
          const comment = data.elements.map(el => el.value).join('');
          this.callback(comment);
        }
      });

      file.on('end', () => {
        this.revAiClient.end();
      });

      revAiStream.on('end', () => {
        this.statusbar.Stopped();
      });
    
      file.pipe(revAiStream);
    } catch (error) {
      this.statusbar.Stopped();
    }
  }
  

    // this.sentence = null;
    // this.stream = null;
    // this.statusbar = statusbar;
    // this.micInputStream = null;
    // this.callback = callback;
  
    
    
    // this.micInstance.start();

    

    // this.client.on('connect', () => {
    //   /* When connected to RevAi */
    //   this.startMic();
    // });
    
    // this.client.on('close', () => {
    //   /* When disconnected from RevAi */
    //   this.statusbar.Stopped();
    //   this.stopMic();
    // });

  // start(): void {
  //   // this.stream = this.client.start();
  //   // this.statusbar.Connecting();

  //   // this.stream.on('data', (data: StreamingHypothesis) => {
      
  //   //   if (data.type === 'final') {
  //   //     this.sentence = data.elements.map(el => el.value).join('');
  //   //     this.stop();
  //   //   }
  //   // });

  //   // this.stream.on('end', () => this.stream && this.stream.removeAllListeners())
  // }

  // stop(): void {
  //   // this.client.emit('close');
  // }

  // startMic(): void {
  //   if (!this.stream) return;

  //   
  //   if (!this.micInputStream) {
  //     /* Create an input stream from connected mic */
  //     this.micInputStream = this.micInstance.getAudioStream();
  //     this.micInputStream.pipe(this.stream);
  //   } else {
  //     /* Resume the previous stream if created */
  //     this.micInstance.resume()
  //   }
  // }

  // stopMic(): void {
  //   /* Pause the mic */
  //   this.micInstance.pause();
  // }
}

