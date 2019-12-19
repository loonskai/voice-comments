import {
  commands,
  ExtensionContext,
  window,
  Position
} from "vscode";
import Recognizer from './recognizer';
import StatusBar from './statusbar';

export function activate(context: ExtensionContext): void {
  const token = process.env.REV_AI_TOKEN || '';
  const recognizer = new Recognizer(token, StatusBar, (message: string) => {
    if ([null, '<unk>.'].includes(message)) return;
    const { activeTextEditor } = window;
    if (activeTextEditor) {
      const { line, character } = activeTextEditor.selection.active;
      
      activeTextEditor.edit(() => {
        const startPosition = new Position(line, character + 1);
        activeTextEditor.edit(editor => {
          editor.insert(startPosition, `// ${message}`)
        });
      });
    }
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
