import { commands, ExtensionContext, window, Position } from 'vscode';
import Recognizer from './recognizer';
import StatusBar from './statusbar';

export function activate(context: ExtensionContext): void {
  const token = process.env.REV_AI_TOKEN || '';
  const recognizer = new Recognizer(token, StatusBar, (message: string) => {
    if (!message) return;
    const { activeTextEditor } = window;
    if (activeTextEditor) {
      const { selection, document } = activeTextEditor;
      const { line } = selection.active;
      const lineLength = document.lineAt(line).text.length;

      activeTextEditor.edit(() => {
        const startPosition = new Position(line, lineLength);
        activeTextEditor.edit(editor => {
          editor.insert(startPosition, ` /* ${message} */`);
        });
      });
    }
  });

  const startRecording = commands.registerCommand(
    'extension.startRecording',
    () => {
      recognizer.start();
    }
  );

  const stopRecording = commands.registerCommand(
    'extension.stopRecording',
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
