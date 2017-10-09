let section = ''

document.body.addEventListener('click', function (event) {
  if (event.target.dataset.section) {
    handleSectionTrigger(event)
  } else if (event.target.dataset.modal) {
    handleModalTrigger(event)
  // } else if (event.target.classList.contains('modal-hide')) {
  //   hideAllModals()
  }
})

function handleSectionTrigger (event) {
  fireChangedSourceFileEvent(event.target.textContent)

  deselectButtons()
  highlightClickedButton(event.target)
  
  if (event.target.dataset.section == section) return;

  hideAllSections()
  displaySection(event.target.dataset.section + '-section')
  
  // Save currently active section type
  section = event.target.dataset.section
}

function fireChangedSourceFileEvent(data) {
  document.querySelector('#source-view-section').dispatchEvent(new CustomEvent('changedSourceFile', {detail: data}))
}

function highlightClickedButton(btn) {
  btn.classList.add('is-selected')
}

function displaySection(sectionId) {
  document.getElementById(sectionId).classList.add('is-shown')
}

function hideAllSections () {
  const sections = document.querySelectorAll('.js-section.is-shown')
  Array.prototype.forEach.call(sections, function (section) {
    section.classList.remove('is-shown')
  })
}

function deselectButtons () {
  const buttons = document.querySelectorAll('.nav-button.is-selected')
  Array.prototype.forEach.call(buttons, function (button) {
    button.classList.remove('is-selected')
  })
}


function handleModalTrigger (event) {
  hideAllModals()
  console.log('test..ok')
  //const modalId = event.target.dataset.modal + '-modal'
  //document.getElementById(modalId).classList.add('is-shown')
}

function hideAllModals () {
  const modals = document.querySelectorAll('.modal.is-shown')
  Array.prototype.forEach.call(modals, function (modal) {
    modal.classList.remove('is-shown')
  })
  showMainContent()
}

function showMainContent () {
  document.querySelector('.js-nav').classList.add('is-shown')
  document.querySelector('.js-content').classList.add('is-shown')
}

showMainContent()