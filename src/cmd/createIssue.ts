import * as vscode from 'vscode';
import {AllServices} from '../constants/services';
import axios from 'axios';

export default async function createIssue() {
  vscode.window.showInformationMessage('Create Issue Command');
  try {
    // get config from settings
    const configuration = vscode.workspace.getConfiguration('issueReporter');
    const webhookUrl = configuration.get<string>('webhookUrl');
    if (!webhookUrl) {
        throw new Error('Webhook URL is not configured. Please set it in settings.');
    }

    // get service
    const service = await vscode.window.showQuickPick(AllServices);
    if (!service) {
        throw new Error('No service selected.');
    }

    // get issue title
    const title = await vscode.window.showInputBox({
      placeHolder: 'Enter issue title',
      prompt: 'Please enter the title for the issue',
      validateInput: text => {
          return text ? null : 'Title cannot be empty';
      }
    });
    if (!title) {
        throw new Error('No title provided.');
    }

    // get issue description
    const description = await vscode.window.showInputBox({
      placeHolder: 'Enter issue description',
      prompt: 'Please enter the description for the issue',
      validateInput: text => {
          return text ? null : 'Description cannot be empty';
      }
    });
    if (!description) {
      throw new Error('No description provided.');
    }
    
    const data = {
        title: title,
        service: service,
        description: description
    };

    const response = await axios.post(webhookUrl, data);

    if (response.status >= 200 && response.status < 300) {
        vscode.window.showInformationMessage('Issue created successfully!');
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }


  } catch (error: Error | any) {
    vscode.window.showErrorMessage(error);
  }
}