(function () {
  const vscode = acquireVsCodeApi();
  const createButton = document.querySelector('#create-button');
  createButton.addEventListener('click', () => createIssue());

  function createIssue() {
    const serviceInput = document.querySelector("#issue-service");
    const titleInput = document.querySelector("#issue-title");
    const descriptionInput = document.querySelector("#issue-description");

    const data = {
      service: serviceInput.value,
      title: titleInput.value,
      description: descriptionInput.value
    };

    vscode.postMessage({ type: 'createIssue', value: data });
  }
}());