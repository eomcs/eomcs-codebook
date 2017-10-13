const path = require('path')
const fs = require('fs')
const settings = require('electron-settings')
const Remarkable = require('remarkable')
const Prism = require('prismjs');
const langExt = require('../language-ext')
const {clipboard} = require('electron')

// 소스 코드에 줄 번호를 붙이는 작업을 수행할 Prism 플러그인 추가.
require('prismjs/plugins/line-numbers/prism-line-numbers')

let markdownRenderer = new Remarkable({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: false, // Convert '\n' in paragraphs into <br>
  linkify: false, // Autoconvert URL-like text to links
  typographer: false, // Enable some language-neutral replacement + quotes beautification

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
  quotes: '“”‘’'
})

const section = document.querySelector('#source-view-section')
const sourceFilename = document.querySelector('#source-filename')
const sourceFileView = document.querySelector('#source-file-view')

let sourcePath;
let sourceLang;
let sourceCode;

section.addEventListener('changedSourceFile', e => {
  setSourceViewTitle(e.detail)

  sourcePath = path.join(settings.get('sourceDir'), e.detail)
  sourceLang = langExt(path.extname(sourcePath))

  loadSourceFile(sourcePath, sourceLang)
})

document.querySelector('#reload-source').addEventListener('click', (e) => {
  loadSourceFile(sourcePath, sourceLang)
})

document.querySelector('#copy-source').addEventListener('click', (e) => {
  var sourceOnly = '';
  sourceCode.split('\n').forEach((value, index) => {
    if (value.indexOf('//:') == -1) {
      sourceOnly += value + '\n'
    }
  })
  clipboard.writeText(sourceOnly)
})

document.querySelector('#copy-source-with-description').addEventListener('click', (e) => {
  clipboard.writeText(sourceCode)
})

function loadSourceFile(path, lang) {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) throw err;

    sourceCode = data
    var markdownCode = toMarkdownCode(sourceCode, lang)
    sourceFileView.innerHTML = markdownRenderer.render(markdownCode)

    // 줄 번호를 붙일 소스 코드 지정하기.
    applyLineNumbers(sourceFileView, lang)

    // Prismjs에서 코드 컬러링 작업할 때 사용할 프로그래밍 언어 규칙 추가.
    loadPrismjsLanguagePlugin(lang)

    // Prismjs를 이용하여 <pre><code>...</code></pre>에 들어 있는 소스코드에 컬러링 적용하기
    Prism.highlightAll();

    // terminal 코드에 대해 스타일 적용하기
    styleTerminalCode(sourceFileView)

    // 일반 코드에 대해 스타일 적용하기
    stylePlainCode(sourceFileView)

    var el = document.querySelectorAll('.line-numbers-row')
    for (var e of el) {
      console.log(e)
    }
  })
}

function toMarkdownCode(source, lang) {
  var markdownCode = ''
  var isCodeBlock = false

  source.split('\n').forEach((value, index) => {
    if (value.indexOf('//:') != -1) {
      value = value.trim();
    }
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
  var codeList = element.querySelectorAll('pre code:not([class*="language"])')
  for (var code of codeList) {
    code.parentElement.classList.add('plain-code')
  }
}

function applyLineNumbers(element, lang) {
  var codeList = element.querySelectorAll('pre code.language-' + lang)
  var startLineNo = 1;
  for (var code of codeList) {
    code.parentElement.classList.add('line-numbers')

    // 화면에 출력될 코드의 시작 줄 번호를 설정한다.
    code.parentElement.setAttribute('data-start', startLineNo)

    // <code>에 들어 있는 코드의 줄 수를 알아낸다.
    let results = code.innerHTML.match(/\n(?!$)/g)

    // 시작 줄 번호에 현재 코드의 줄 수를 더해서 다음 코드의 시작 줄 번호를 계산한다.
    startLineNo += results ? results.length + 1 : 1
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
