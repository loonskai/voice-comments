import mic from 'mic';
import StatusBar from './statusbar';
import {
  AudioConfig,
  RevAiStreamingClient,
  StreamingHypothesis,
} from 'revai-node-sdk';
import { Duplex } from 'stream';

export default class Recognizer {
  micInstance: mic.MicInstance;
  micInputStream: mic.MicInputStream | null;

  client: RevAiStreamingClient;
  stream: Duplex | null;
  sentence: string | null;
  statusbar: typeof StatusBar;
  callback: any;

  constructor(token: string, statusbar: typeof StatusBar, callback: any) {
    this.sentence = null;
    this.stream = null;
    this.statusbar = statusbar;
    this.micInputStream = null;
    this.callback = callback;
  
    this.statusbar.Init();
    this.micInstance = mic({
      rate: '16000',
      channels: '1',
      device: 'plughw',
      fileType: 'wav',
      exitOnSilence: 1
    });
    this.micInstance.start();

    this.client = new RevAiStreamingClient(
      token,
      new AudioConfig('audio/x-raw', 'interleaved', 16000, 'S16LE', 1)
    );

    this.client.on('connect', () => {
      console.log('Connected to RevAi');
      this.startMic();
    });

    this.client.on('close', () => {
      console.log('Disconnected from RevAi');
      this.statusbar.Stopped();

      this.stopMic();
    });
  }

  start(): void {
    this.stream = this.client.start();
    this.statusbar.Connecting();

    this.stream.on('data', (data: StreamingHypothesis) => {
      
      if (data.type === 'final') {
        this.sentence = data.elements.map(el => el.value).join('');
        this.stop();
      }
    });
  }

  stop(): void {
    this.client.emit('close');
    this.callback(this.sentence);
    console.log('-------------')
  }

  startMic(): void {
    if (!this.stream) {
      console.log('Not connected to RevAi')
      return;
    }
  
    this.statusbar.Recording();
    if (!this.micInputStream) {
      console.log('Start mic')
      this.micInputStream = this.micInstance.getAudioStream();
      this.micInputStream.pipe(this.stream);
      this.micInputStream.on('stopComplete', function() {
        console.log("micInputStream stopComplete");
      });
    } else {
      console.log('Resume mic')
      this.micInstance.resume()
    }
  }

  stopMic() {
    console.log('Pause mic')
    this.micInstance.pause();
  }
}

