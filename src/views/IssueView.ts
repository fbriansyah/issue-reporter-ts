import axios from "axios";
import * as vscode from "vscode";
import { getNonce } from "../utils/common";
import { AllServices } from "../constants/services";

interface Issue {
  service?: string;
  title?: string;
  description?: string;
}

export class IssueViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "issue-reporter-ts.issueView";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'createIssue':
          {
            await this._sentIssue(data.value);
          }
      }
    });
  }

  private async _sentIssue(issue: Issue) {
    try {
      const configuration = vscode.workspace.getConfiguration('issueReporter');
      const webhookUrl = configuration.get<string>('webhookUrl');

      if (!webhookUrl) {
        throw new Error('Webhook URL is not configured. Please set it in settings.');
      }
      if (!issue.service) {
        throw new Error('Service is not provided.');
      }
      if (!issue.title) {
        throw new Error('Title is not provided.');
      }
      if (!issue.description) {
        throw new Error('Description is not provided.');
      }
      const data  = {
        service: issue.service,
        title: issue.title.replace(/\n/g, " "),
        description: issue.description.replace(/\n/g, " ")
      };
      const response = await axios.post(webhookUrl, data);
      
      if (response.status >= 200 && response.status < 300) {
        if(this._view) {
          this._view.webview.postMessage({ type: 'issueCreated' });
        }
        vscode.window.showInformationMessage('Issue created successfully!');
      } else {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error: Error | any) {
      vscode.window.showErrorMessage(error.message);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "issue-reporter-view.js")
    );

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "issue-reporter-view.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    let serviceOptions = '';
    for(let service of AllServices) {
      serviceOptions += `<option value="${service.value}">${service.name}</option>`;
    }

    return `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
            <link href="${styleResetUri}" rel="stylesheet">
            <link href="${styleVSCodeUri}" rel="stylesheet">
            <link href="${styleMainUri}" rel="stylesheet">
    
            <title>Issue Reporter</title>
          </head>
          <body>
            <div>
              <label class="label">Select Service</label>
              <select id="issue-service" name="issue-service" class="issue-select">
                <option value=""> - Choose One - </option>
                ${serviceOptions}
              </select>
            </div>
            <div class="input-control">
              <input 
                id="issue-title" 
                name="issue-title" 
                type="text" 
                class="issue-input" 
                placeholder="Issue Title"
              />
            </div>

            <div class="input-control">
              <textarea 
                id="issue-description" 
                name="issue-description"
                class="issue-input" 
                rows="6"
                placeholder="Issue description"
              ></textarea>
            </div>
    
            <button id="create-button" class="add-issue-button">Create Issue</button>
    
            <script nonce="${nonce}" src="${scriptUri}"></script>
          </body>
          </html>`;
  }
}