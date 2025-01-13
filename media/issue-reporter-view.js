(function () {
  const vscode = acquireVsCodeApi();
  const createButton = document.querySelector('#create-button');
  const serviceInput = document.querySelector("#issue-service");
  const titleInput = document.querySelector("#issue-title");
  const descriptionInput = document.querySelector("#issue-description");

  createButton.addEventListener('click', () => createIssue());

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'issueCreated':
        {
          serviceInput.value = '';
          titleInput.value = '';
          descriptionInput.value = '';
          break;
        }
    }
  });

  function createIssue() {
    const data = {
      service: serviceInput.value,
      title: titleInput.value,
      description: descriptionInput.value
    };

    vscode.postMessage({ type: 'createIssue', value: data });
  }
}());