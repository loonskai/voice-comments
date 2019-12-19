import mic from 'mic';
import {
  AudioConfig,
  RevAiStreamingClient,
  StreamingHypothesis
} from 'revai-node-sdk';

export default class Recognizer {
  micInstance: mic.MicInstance;
  micInputStream: mic.MicInputStream;
  client: RevAiStreamingClient;

  constructor(token: string) {
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

  start(): void {
    const stream = this.client.start();

    stream.on('data', (data: StreamingHypothesis) => {
      if (data.type === 'final') {
        const sentence = data.elements.map(el => el.value).join('');
        console.log(sentence);
        this.micInstance.stop();
        this.client.end();
      }
    });
  }

  stop(): void {
    this.micInstance.stop();
  }

  private startMicRecording(stream: NodeJS.ReadStream): void {
    this.micInstance.start();
    this.micInputStream.pipe(stream);

  }

  private stopMicRecording(): void {
    this.micInstance.stop();
  }
}

