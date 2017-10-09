const path = require('path')
const fs = require('fs')
const settings = require('electron-settings')
const Remarkable = require('remarkable')
const Prism = require('prismjs');
const langExt = require('../language-ext')

let markdownRenderer = new Remarkable({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: false, // Convert '\n' in paragraphs into <br>
  linkify: false, // Autoconvert URL-like text to links
  typographer: false, // Enable some language-neutral replacement + quotes beautification

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
  quotes: '“”‘’',

  // Modify the generated HTML by highlighting the code directly
  // by Prismjs 
  highlight: function (str, lang) {
    var language = !lang ? 'markup' : lang;

    if (!Prism.languages[language]) {
      require('prismjs/components/prism-' + language); 
    }

    try {
      return Prism.highlight(str, Prism.languages[language]);
    } catch (err) {}

    return ''; // use external default escaping
  }, 

  // by Highlight.js
  /*
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
        try {
            return hljs.highlight(lang, str).value;
        } catch (err) {}
    }

    try {
        return hljs.highlightAuto(str).value;
    } catch (err) {}

    return ''; // use external default escaping
  }
  */
})

const section = document.querySelector('#source-view-section')
const sourceFilename = document.querySelector('#source-filename')
const sourceFileView = document.querySelector('#source-file-view')

section.addEventListener('changedSourceFile', e => {
  setSourceViewTitle(e.detail)

  var sourceFilePath = path.join(settings.get('sourceDir'), e.detail)
  let lang = langExt(path.extname(e.detail))


  fs.readFile(sourceFilePath, 'utf8', (err, data) => {
    if (err) throw err;

    var markdownSource = ''
    var isCodeBlock = false

    data.split('\n').forEach((value, index) => {
      if (value.startsWith('//:')) {
        if (isCodeBlock) { // 코드 블록을 끝낸다. 
          markdownSource += '```\n'
          isCodeBlock = false
        }
        markdownSource += value.replace('//:', '') + '\n'

      } else {
        if (!isCodeBlock) { // 코드 블록을 시작한다.
          markdownSource += '```' + lang + '\n'
          isCodeBlock = true
        }
        markdownSource += value + '\n'
      }
    })
    if (isCodeBlock) { // 코드 블록을 끝낸다. 
      markdownSource += '```\n'
    }

    var re = new RegExp('```' + lang + '\\s*```', 'g')
    markdownSource = markdownSource.replace(re, '')
    sourceFileView.innerHTML = markdownRenderer.render(markdownSource)

    var codeList = sourceFileView.querySelectorAll('pre code:not([class|="language"])')
    for (var code of codeList) {
      code.parentElement.classList.add('terminal')
    }
  });
})

function setSourceViewTitle(title) {
  sourceFilename.innerHTML = title
}
