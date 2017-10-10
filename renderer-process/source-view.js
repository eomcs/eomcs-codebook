const path = require('path')
const fs = require('fs')
const settings = require('electron-settings')
const Remarkable = require('remarkable')
const Prism = require('prismjs');
const langExt = require('../language-ext')

require('prismjs/plugins/line-numbers/prism-line-numbers')

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
    loadPrismjsLanguagePlugin(lang)
    var language =  isSupportedLanguage(lang) ? lang : 'markup';
    
    try {
      return Prism.highlight(str, Prism.languages[language]);
    } catch (err) {}

    return ''; // use external default escaping
  }, 
})

const section = document.querySelector('#source-view-section')
const sourceFilename = document.querySelector('#source-filename')
const sourceFileView = document.querySelector('#source-file-view')

section.addEventListener('changedSourceFile', e => {
  setSourceViewTitle(e.detail)

  var sourceFilePath = path.join(settings.get('sourceDir'), e.detail)
  let lang = langExt(path.extname(e.detail))


  fs.readFile(sourceFilePath, 'utf8', (err, sourceCode) => {
    if (err) throw err;

    var markdownCode = toMarkdownCode(sourceCode, lang)
    sourceFileView.innerHTML = markdownRenderer.render(markdownCode)

    // terminal 코드에 대해 스타일 적용하기
    styleTerminalCode(sourceFileView)

    // 일반 코드에 대해 스타일 적용하기
    stylePlainCode(sourceFileView)

    // 소스코드 줄 번호 적용하기
    styleLineNumbers(sourceFileView, lang)
    
  });
})

function toMarkdownCode(sourceCode, lang) {
  var markdownCode = ''
  var isCodeBlock = false

  sourceCode.split('\n').forEach((value, index) => {
    if (value.startsWith('//:')) {
      if (isCodeBlock) { // 코드 블록을 끝낸다. 
        markdownCode += '```\n'
        isCodeBlock = false
      }
      markdownCode += value.replace('//:', '') + '\n'

    } else {
      if (!isCodeBlock) { // 코드 블록을 시작한다.
        markdownCode += '```' + lang + '\n'
        isCodeBlock = true
      }
      markdownCode += value + '\n'
    }
  })
  if (isCodeBlock) { // 코드 블록을 끝낸다. 
    markdownCode += '```\n'
  }

  markdownCode = removeEmptyCode(markdownCode)

  return markdownCode
}

function removeEmptyCode(markdownCode) {
  var re = new RegExp('```\\w+\\s*```', 'g')
  return markdownCode.replace(re, '')
}

function styleTerminalCode(element) {
  var codeList = element.querySelectorAll('pre code.language-terminal')
  for (var code of codeList) {
    code.parentElement.classList.add('terminal')
  }
}

function stylePlainCode(element) {
  var codeList = element.querySelectorAll('pre code:not([class|="language"])')
  for (var code of codeList) {
    code.parentElement.classList.add('plain-code')
  }
}

function styleLineNumbers(element, lang) {
  var codeList = element.querySelectorAll('pre code.language-' + lang)
  for (var code of codeList) {
    code.parentElement.classList.add('line-numbers')
  }
  
}


function setSourceViewTitle(title) {
  sourceFilename.innerHTML = title
}

function loadPrismjsLanguagePlugin(language) {
  if (!Prism.languages[language]) {
    try {
      require('prismjs/components/prism-' + language)
    } catch (err) {
      return false
    }
  }
  return true
}

function isSupportedLanguage(lang) {
  if (Prism.languages[lang])
    return true
  return false
}
