import mic from 'mic';
import {
  AudioConfig,
  RevAiStreamingClient,
  StreamingHypothesis,
} from 'revai-node-sdk';
import { Duplex } from 'stream';

export default class Recognizer {
  micInstance: mic.MicInstance;
  micInputStream: mic.MicInputStream;
  client: RevAiStreamingClient;
  sentence: string | null;

  constructor(token: string) {
    this.sentence = null;
    this.micInstance = mic({
      rate: '16000',
      channels: '1',
      device: 'plughw',
      fileType: 'wav',
      exitOnSilence: 1
    });
    this.micInputStream = this.micInstance.getAudioStream();

    this.client = new RevAiStreamingClient(
      token,
      new AudioConfig('audio/x-raw', 'interleaved', 16000, 'S16LE', 1)
    );

    this.micInputStream.on('error', (err: any) => {
      console.log('Error in Input Stream: ' + err);
    });

    this.micInputStream.on('stopComplete', function() {
      console.log('Got SIGNAL stopComplete');
    });

    this.client.on('close', (code, reason) => {
      console.log(`Connection closed, ${code}: ${reason}`);
    });
    
    this.client.on('connectFailed', error => {
      console.log(`Connection failed with error: ${error}`);
    });
    
    this.client.on('connect', connectionMessage => {
      console.log(connectionMessage);
      console.log('Speak');
      // micInstance.start();
    });
  }

  start(cb: () => void): void {
    const stream = this.client.start();
    stream.on('data', (data: StreamingHypothesis) => {
      if (data.type === 'final') {
        this.sentence = data.elements.map(el => el.value).join('');
        this.stop();
        cb()
      }
    });

    this.startMicRecording(stream);
  }

  stop(): void {
    this.stopMicRecording();
    this.client.end();
  }

  private startMicRecording(stream: Duplex): void {
    this.micInstance.start();
    this.micInputStream.pipe(stream);
  }

  private stopMicRecording(): void {
    this.micInstance.stop();
  }
}

