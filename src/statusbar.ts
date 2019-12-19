import {
  StatusBarItem,
  StatusBarAlignment,
  window
} from "vscode";

export default class StatusBar {
  private static _statusBarItem: StatusBarItem;

  static get statusbar(): StatusBarItem {
    if (!StatusBar._statusBarItem) {
      StatusBar._statusBarItem = window.createStatusBarItem(
        StatusBarAlignment.Left,
        100
      );
      this.statusbar.show();
    }

    return StatusBar._statusBarItem;
  }
  static Init(): void {
    setTimeout(function() {
      StatusBar.Stopped();
    }, 1000);
  }

  public static Recording(): void {
    StatusBar.statusbar.text = "$(circle-filled) Recording";
    StatusBar.statusbar.command = "extension.stopRecording";
    StatusBar.statusbar.tooltip = "Stop comment recording";
  }

  public static Stopped(): void {
    StatusBar.statusbar.text = "$(play) Record a comment";
    StatusBar.statusbar.command = "extension.startRecording";
    StatusBar.statusbar.tooltip = "Start recording a comment";
  }
}