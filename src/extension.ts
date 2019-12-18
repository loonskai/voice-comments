import {
  commands,
  ExtensionContext,
  StatusBarItem,
  StatusBarAlignment,
  window
} from "vscode";

class StatusbarUi {
  private static _statusBarItem: StatusBarItem;

  static get statusbar(): StatusBarItem {
    if (!StatusbarUi._statusBarItem) {
      StatusbarUi._statusBarItem = window.createStatusBarItem(
        StatusBarAlignment.Left,
        100
      );
      this.statusbar.show();
    }

    return StatusbarUi._statusBarItem;
  }
  static Init(): void {
    setTimeout(function() {
      StatusbarUi.Stopped();
    }, 1000);
  }

  public static Recording(): void {
    StatusbarUi.statusbar.text = "$(circle-filled) Recording";
    StatusbarUi.statusbar.command = "extension.stopRecording";
    StatusbarUi.statusbar.tooltip = "Stop comment recording";
  }

  public static Stopped(): void {
    StatusbarUi.statusbar.text = "$(play) Record a comment";
    StatusbarUi.statusbar.command = "extension.startRecording";
    StatusbarUi.statusbar.tooltip = "Start recording a comment";
  }
}

export function activate(context: ExtensionContext): void {
  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
  statusBarItem.command = "extension.startRecording";
  StatusbarUi.Stopped();

  const startRecording = commands.registerCommand(
    "extension.startRecording",
    () => {
      StatusbarUi.Recording();
      window.showInformationMessage("Start recording");
    }
  );

  const stopRecording = commands.registerCommand(
    "extension.stopRecording",
    () => {
      StatusbarUi.Stopped();
      window.showInformationMessage("Stop recording");
    }
  );

  context.subscriptions.push(startRecording);
  context.subscriptions.push(stopRecording);
}

export function deactivate(): void {
  return undefined;
}
