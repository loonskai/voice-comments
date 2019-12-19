declare module 'mic' {  

  export function createInstance(options: MicOptions): MicInstance;
  
  export interface MicOptions {
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

  export interface MicInstance {
    getAudioStream: () => MicInputStream;
    start: () => void;
    stop: () => void;
  }

  export type MicInputStream = NodeJS.ReadWriteStream

}
