const path = require('path')
const glob = require('glob')
const settings = require('electron-settings')
const Handlebars = require('handlebars')
const ipc = require('electron').ipcRenderer

const sourceLinkTemplate = document.querySelector('link[rel="import"][data-templateid="source-link"]').import.querySelector(".part-template").innerHTML
const sourceList = document.querySelector('.source-list')

ipc.on('selected-directory', function (event, selectedDir) {
  var sourceDir = path.join(selectedDir, "/")
  settings.set('sourceDir', sourceDir)
  document.querySelector('#examples-dir').innerHTML = path.basename(sourceDir)

  var templateEngine = Handlebars.compile(sourceLinkTemplate)
  var html = ''

  glob.sync(path.join(sourceDir, '**/*.java')).forEach(function (file) {
    file = file.replace(/\//g, path.sep)
    html += templateEngine({sourcePath: file.replace(sourceDir, '')})
  })
  sourceList.innerHTML = html
})
