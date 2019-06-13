var programModel, incomingModel

const incomingSelect = document.getElementById('incomingSelect') as HTMLSelectElement

export function init(_programModel, _incomingModel) {
  programModel = _programModel
  incomingModel = _incomingModel

  incomingSelect.onchange = function () {
    incomingModel.setValue(incomings[incomingSelect.value])
  }
}

var incomings: string[] = []

export function useExample(content: string) {
  var parts = content.split('//>>>---').slice(1)
  var firstIncoming = true

  incomings.splice(0)
  incomingSelect.innerHTML = ''

  parts.forEach(text => {
    const header = /^\s*(program|data)(?:\:\s*(.+))?[\r\n]+/.exec(text)
    const remains = text.slice(header[0].length)
    if (header[1] === 'program') {
      programModel.setValue(remains)
    }
    if (header[1] === 'data') {
      const opt = document.createElement('option')
      opt.value = String(incomings.length)
      opt.textContent = header[2]
      opt.selected = incomings.length == 0
      incomingSelect.appendChild(opt)

      incomings.push(remains)
      if (firstIncoming) {
        incomingModel.setValue(remains)
        firstIncoming = false
      }
    }
  })
}