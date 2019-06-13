import { h, Component, ComponentChild, FunctionalComponent, ComponentChildren, render, } from "preact"

interface IJsNodeProps {
  obj: any
  propLabel?: string,
  expandLevels?: number,
}

interface IJsNodeState {
  expanded: boolean
}

namespace Styled {
  // Dark theme
  // export const Keyword: FunctionalComponent = ({ children: x }) => <span style="color: #569cd6">{x}</span>
  // export const Symbol: FunctionalComponent = ({ children: x }) => <span style="color: #9cdcfe">{x}</span>
  // export const MethodSymbol: FunctionalComponent = ({ children: x }) => <span style="color: #dcdcaa">{x}</span>
  // export const TypeSymbol: FunctionalComponent = ({ children: x }) => <span style="color: #4ec9b0">{x}</span>
  // export const Number: FunctionalComponent = ({ children: x }) => <span style="color: #b5cea8">{x}</span>
  // export const String: FunctionalComponent = ({ children: x }) => <span style="color: #ce9178">{x}</span>

  // Bright theme
  export const Keyword: FunctionalComponent = ({ children: x }) => <span style="color: #aa0d91">{x}</span>
  export const Symbol: FunctionalComponent = ({ children: x }) => <span style="color: #008eda">{x}</span>
  export const MethodSymbol: FunctionalComponent = ({ children: x }) => <span style="color: #000000">{x}</span>
  export const TypeSymbol: FunctionalComponent = ({ children: x }) => <span style="color: #008080">{x}</span>
  export const Number: FunctionalComponent = ({ children: x }) => <span style="color: #09885a">{x}</span>
  export const String: FunctionalComponent = ({ children: x }) => <span style="white-space: pre-wrap; color: #c41a16">"{x}"</span>

  export const Symbol_: FunctionalComponent<{ x: Symbol }> = ({ x }) => <span><Keyword>Symbol</Keyword>{x.toString().slice(6)}</span>
  export const Function_ = ({ x }: { x: Function }) => <span><Keyword>fn </Keyword><MethodSymbol>{x.name}</MethodSymbol>{`() { ... }`}</span>
  export const Object_ = ({ x }: { x: Object }) => {
    const prototype = Object.getPrototypeOf(x)
    const canExpandKey = !prototype || prototype.constructor === Object
    return <span>
      <TypeSymbol>{prototype ? prototype.constructor.name : "object"}</TypeSymbol>
      {
        (canExpandKey && ` { ${Object.keys(x).length} keys }`) ||
        (('length' in x) && ` [ ${x['length']} items ]`) ||
        (typeof x['toString'] === 'function' && ` : ${x.toString()}`) ||
        ""
      }
    </span>
  }

  export const Bullet: FunctionalComponent<{ state: "none" | "open" | "closed", onClick: () => void }> = ({ state, onClick }) =>
    <span style="position:absolute;left:0;cursor:pointer;width:1em;text-align:center" onClick={onClick}>
      {state === "open" ? "-" : state === "closed" ? "+" : ""}
    </span>
}

export class JsNode extends Component<IJsNodeProps, IJsNodeState> {
  constructor(props: IJsNodeProps) {
    super(...arguments)

    this.state = {
      expanded: (props.expandLevels > 0 && typeof props.obj === 'object' && props.obj !== null && Object.keys(props.obj).length < 20),
    }
  }

  shouldComponentUpdate(nextProp: IJsNodeProps, nextState: IJsNodeState) {
    return nextProp.obj !== this.props.obj || nextProp.propLabel !== this.props.propLabel || nextState.expanded !== this.state.expanded
  }

  toggleExpansion = () => this.setState((s: IJsNodeState) => ({ expanded: !s.expanded }))

  render(props: IJsNodeProps, state: IJsNodeState) {
    let { propLabel } = props
    try {
      return this._render(props, state)
    } catch (err) {
      let propLabelEl = propLabel ? <Styled.Symbol>{propLabel + ": "}</Styled.Symbol> : null
      return <div style="padding-left: 1em; position: relative" class="json-viewer-failed">
        {propLabelEl}
        <i>Can't present data</i>
      </div>
    }
  }

  _render({ obj, propLabel, expandLevels = 0 }: IJsNodeProps, state: IJsNodeState) {
    let propLabelEl = propLabel ? <Styled.Symbol>{propLabel + ": "}</Styled.Symbol> : null
    let nodeText: ComponentChild = "unknown"
    let expandable = false

    if (typeof obj === "undefined") nodeText = <Styled.Keyword>undefined</Styled.Keyword>
    else if (typeof obj === "string") nodeText = <Styled.String>{obj}</Styled.String>
    else if (typeof obj === "number") nodeText = <Styled.Number>{obj}</Styled.Number>
    else if (typeof obj === "symbol") nodeText = <Styled.Symbol_ x={obj} />
    else if (typeof obj === "boolean") nodeText = <Styled.Keyword>{obj ? "true" : "false"}</Styled.Keyword>
    else if (typeof obj === "function") nodeText = <Styled.Function_ x={obj} />
    else if (obj === null) nodeText = <Styled.Keyword>null</Styled.Keyword>
    else if (typeof obj === 'object') {
      expandable = true
      nodeText = <Styled.Object_ x={obj} />
    } else {
      nodeText = <span>{obj + ''}</span>
    }

    let expandedInfo: ComponentChild[] = null

    if (expandable && state.expanded) {
      expandedInfo = []
      for (const k in obj) {
        expandedInfo.push(<JsNode expandLevels={expandLevels - 1} propLabel={k} obj={obj[k]} key={k} />)
      }
    }

    return <div style="padding-left: 1em; position: relative" class="json-viewer-node">
      <Styled.Bullet onClick={this.toggleExpansion} state={!expandable ? "none" : state.expanded ? "open" : "closed"} />
      <div style={expandable && "cursor:pointer"} onClick={this.toggleExpansion} key="nodeText">{propLabelEl}{nodeText}</div>
      {expandedInfo}
    </div>
  }
}

export function renderObjectTo(container: HTMLElement, obj: any) {
  return render(<JsNode obj={obj} expandLevels={2} />, container)
}