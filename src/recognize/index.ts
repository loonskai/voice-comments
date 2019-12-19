import { config } from 'dotenv';
config();

import mic from 'mic';
import {
  AudioConfig,
  RevAiStreamingClient,
  StreamingHypothesis
} from 'revai-node-sdk';

const micInstance = mic({
  rate: '16000',
  channels: '1',
  device: 'plughw',
  fileType: 'wav',
  exitOnSilence: 1
});

const micInputStream = micInstance.getAudioStream();

micInputStream.on('error', (err: any) => {
  console.log('Error in Input Stream: ' + err);
});

const audioConfig = new AudioConfig(
  'audio/x-raw',
  'interleaved',
  16000,
  'S16LE',
  1
);
const token = process.env.REV_AI_TOKEN || '';
const client = new RevAiStreamingClient(token, audioConfig);

client.on('close', (code, reason) => {
  console.log(`Connection closed, ${code}: ${reason}`);
});

client.on('connectFailed', error => {
  console.log(`Connection failed with error: ${error}`);
});

client.on('connect', connectionMessage => {
  console.log(connectionMessage);
  console.log('Speak');
  micInstance.start();
});

const stream = client.start();
micInputStream.pipe(stream);
stream.on('data', (data: StreamingHypothesis) => {
  if (data.type === 'final') {
    const sentence = data.elements.map(el => el.value).join('');
    console.log(sentence);
    micInstance.stop();
    client.end();
  }
});

micInputStream.on('stopComplete', function() {
  console.log('Got SIGNAL stopComplete');
});

console.log('Connecting...');
