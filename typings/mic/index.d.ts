declare module 'mic' {
  type InputStream = NodeJS.ReadWriteStream

  interface Instance {
    getAudioStream: () => InputStream;
    start: () => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
  }

  interface Options {
    endian?: 'big' | 'little';
    bitwidth?: string;
    encoding?: 'signed-integer' | 'unsigned-integer';
    rate?: string | number;
    channels?: string | number;
    device?: string;
    exitOnSilence?: number;
    debug?: boolean;
    fileType?: string;
  }

  namespace mic {
    type MicInstance = Instance
    type MicInputStream = InputStream
  }

  function mic(options: Options): Instance;
  export = mic;
}