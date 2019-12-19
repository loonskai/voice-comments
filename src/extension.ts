import {
  commands,
  ExtensionContext,
  window,
} from "vscode";
import Recognizer from './recognizer';
import StatusBar from './statusbar';

export function activate(context: ExtensionContext): void {
  const token = process.env.REV_AI_TOKEN || '';
  const recognizer = new Recognizer(token, StatusBar, (message: string) => {
    window.showInformationMessage(message);
  });

  const startRecording = commands.registerCommand(
    "extension.startRecording",
    () => {
      recognizer.start();
    }
  );

  const stopRecording = commands.registerCommand(
    "extension.stopRecording",
    () => {
      recognizer.stop();
    }
  );

  context.subscriptions.push(startRecording);
  context.subscriptions.push(stopRecording);
}

export function deactivate(): void {
  return undefined;
}
