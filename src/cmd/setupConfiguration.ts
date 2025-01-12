import * as vscode from 'vscode';

export default async function setupConfiguration() {
  const configuration = vscode.workspace.getConfiguration('issueReporter');
  const webhookUrl = configuration.get<string>('webhookUrl');
  let webhookString = '';
  if (webhookUrl) {
    webhookString = webhookUrl;
  }
  try {
    const webhookInput = await vscode.window.showInputBox({
      placeHolder: 'Enter webhook URL',
      prompt: 'Please enter the webhook URL',
      value: webhookString,
      validateInput: text => {
          return text ? null : 'Webhook Url cannot be empty';
      }
    });
    if (webhookInput) {
      configuration.update('webhookUrl', webhookInput, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('Webhook URL set successfully!');
    }
  } catch(error: Error | any) {
    vscode.window.showErrorMessage('Error setting up configuration: ' + error.message);
  }
}