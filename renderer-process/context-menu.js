const ipc = require('electron').ipcRenderer

document.querySelector('.nav-category').addEventListener('click', function () {
  ipc.send('show-context-menu')
})