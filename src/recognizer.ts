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

  // client: RevAiStreamingClient;
  // stream: Duplex | null;
  // sentence: string | null;
  statusbar: typeof StatusBar;
  // callback: any;

  constructor(token: string, statusbar: typeof StatusBar, callback: any) {
    this.filePath = path.resolve(__dirname, 'output.raw');
    this.statusbar = statusbar;
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
    try {
      this.createMicInstance();
      if (this.micInstance && this.micInputStream) {
        this.micInstance.start()
        const outputFileStream = fs.createWriteStream(this.filePath);
        this.micInputStream.pipe(outputFileStream)

        this.statusbar.Recording();

      /* EVENT LISTENERS */
      // outputFileStream.on('pipe', () => {
      //   console.log('FILE piped');
      // }).on("error", function(error){
      //   console.log(error)
      // }).on('finish', () => {
      //   console.log('FILE finish')
      // })

      this.micInputStream.on('pauseComplete', function() {
        // outputFileStream.end()
      });
      this.micInputStream.on('data', function(data) {
        // outputFileStream.write(data)
      });
    }

    } catch (error) {
      console.log(error)
    }
  }

  stop(): void {
    this.micInstance.stop();
    this.statusbar.Stopped();
  }
  

    // this.sentence = null;
    // this.stream = null;
    // this.statusbar = statusbar;
    // this.micInputStream = null;
    // this.callback = callback;
  
    
    
    // this.micInstance.start();

    // this.client = new RevAiStreamingClient(
    //   token,
    //   new AudioConfig('audio/x-raw', 'interleaved', 16000, 'S16LE', 1)
    // );

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

