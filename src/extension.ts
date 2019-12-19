import {
  commands,
  ExtensionContext,
  window,
} from "vscode";
import Recognizer from './recognizer';
import StatusBar from './statusbar';

export function activate(context: ExtensionContext): void {
  const token = process.env.REV_AI_TOKEN || '';
  const recognizer = new Recognizer(token, StatusBar);

  const startRecording = commands.registerCommand(
    "extension.startRecording",
    () => {
      window.showInformationMessage('Connect to service');
      recognizer.start();
    }
  );

  const stopRecording = commands.registerCommand(
    "extension.stopRecording",
    () => {
      window.showInformationMessage('Stopped');
      recognizer.stop();
    }
  );

  context.subscriptions.push(startRecording);
  context.subscriptions.push(stopRecording);
}

export function deactivate(): void {
  return undefined;
}
