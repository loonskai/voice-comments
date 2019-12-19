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
    StatusBar.statusbar.text = "$(circle-filled) Recording...";
    StatusBar.statusbar.command = "extension.stopRecording";
    StatusBar.statusbar.tooltip = "Stop comment recording";
  }

  public static Stopped(): void {
    StatusBar.statusbar.text = "$(play) Record a comment";
    StatusBar.statusbar.command = "extension.startRecording";
    StatusBar.statusbar.tooltip = "Start recording a comment";
  }

  public static Connecting(): void {
    StatusBar.statusbar.text = "$(loading) Connecting";
    StatusBar.statusbar.command = undefined;
    StatusBar.statusbar.tooltip = "Connecting to the server";
  }

  public static Processing(): void {
    StatusBar.statusbar.text = "$(ellipsis) Processing";
    StatusBar.statusbar.command = undefined;
    StatusBar.statusbar.tooltip = "Record processing";
  }
}