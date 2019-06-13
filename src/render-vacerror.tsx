import { h, render } from 'preact'
type VACError = any;

const VACErrorDisplay = ({ err }: { err: VACError }) =>
  <div class="vacerror">
    <div><b>[playground]</b> your program threw a VACError</div>
    <ul>
      {err.errors.map(e => <li><span class="label">{e.label}</span> {String(e.error)}</li>)}
    </ul>
  </div>

export function renderVACError(err: VACError) {
  const frag = document.createDocumentFragment()
  render(<VACErrorDisplay err={err} />, frag)
  return frag
}