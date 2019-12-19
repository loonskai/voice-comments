import { config } from 'dotenv';
config();

import {
  commands,
  ExtensionContext,
  window
} from "vscode";
import Recognizer from './recognizer';
import StatusBar from './statusbar';



export function activate(context: ExtensionContext): void {
  const token = process.env.REV_AI_TOKEN || '';
  const recognizer = new Recognizer(token);

  StatusBar.Stopped();

  const startRecording = commands.registerCommand(
    "extension.startRecording",
    () => {
      StatusBar.Recording();
      window.showInformationMessage("Start recording");
      recognizer.start();
    }
  );

  const stopRecording = commands.registerCommand(
    "extension.stopRecording",
    () => {
      StatusBar.Stopped();
      window.showInformationMessage("Stop recording");
    }
  );

  context.subscriptions.push(startRecording);
  context.subscriptions.push(stopRecording);
}

export function deactivate(): void {
  return undefined;
}
