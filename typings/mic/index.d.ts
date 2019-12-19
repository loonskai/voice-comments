declare module 'mic' {
  interface MicOptions {
    endian?: 'big' | 'little';
    bitwidth?: string;
    encoding?: 'signed-integer' | 'unsigned-integer';
    rate?: string;
    channels?: string;
    device?: string;
    exitOnSilence?: number;
    debug?: boolean;
    fileType?: string;
  }

  interface MicInstance {
    getAudioStream: () => NodeJS.ReadWriteStream;
    start: () => void;
    stop: () => void;
  }

  const x: (options: MicOptions) => MicInstance;
  export = x;
}
