// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import createIssue from './cmd/createIssue';
import setupConfiguration from './cmd/setupConfiguration';
import { ColorsViewProvider } from './views/CollorView';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "issue-reporter-ts" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('issue-reporter-ts.createIssue', createIssue);
	const disposableSetupCmd = vscode.commands.registerCommand('issue-reporter-ts.setup', setupConfiguration);

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposableSetupCmd);

	// Create the colors view
	const provider = new ColorsViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('calicoColors.addColor', () => {
			provider.addColor();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('calicoColors.clearColors', () => {
			provider.clearColors();
		}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
