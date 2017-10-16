const path = require('path')
const glob = require('glob')
const settings = require('electron-settings')
const Handlebars = require('handlebars')
const ipc = require('electron').ipcRenderer

const sourceLinkTemplate = document.querySelector('link[rel="import"][data-templateid="source-link"]').import.querySelector(".part-template").innerHTML
const sourceLinkTemplateEngine = Handlebars.compile(sourceLinkTemplate)
const sourceList = document.querySelector('.source-list')

ipc.on('selected-directory', function (event, selectedDir) {
  if (!document.querySelector('.nav-category.is-shown')) {
    var navCategory = document.querySelector('.nav-category')
    navCategory.classList.add('is-shown')
  }
  var selectedDir = path.join(selectedDir, "/")
  settings.set('selectedDir', selectedDir)
  document.querySelector('#examples-dir').innerHTML = path.basename(selectedDir)
  
  listFiles(selectedDir)
})

ipc.on('refresh-selected-directory', function (event) {
  listFiles(settings.get('selectedDir'))
})

function listFiles(selectedDir) {
  var html = ''
  glob.sync(path.join(selectedDir, '**/*.java')).forEach(function (file) {
    file = file.replace(/\//g, path.sep)
    html += sourceLinkTemplateEngine({sourcePath: file.replace(selectedDir, '')})
  })
  sourceList.innerHTML = html

  const sections = document.querySelectorAll('.js-section.is-shown')
  Array.prototype.forEach.call(sections, function (section) {
    section.classList.remove('is-shown')
  })
}