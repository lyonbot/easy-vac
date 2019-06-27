import { VProp, VType, VPropMetas } from "./core";
import { getVType } from "./vtypes/index";

export interface VACErrorItem {
  error: Error
  message: string
  label: string
  labelParts: VProp['label'][]
}

export type PostValidateFn<T = any> = (value: T, p: VProp<any>, ctx: VACContext) => void
const postValidateFns: PostValidateFn[] = []

export function addPostValidateFn(f: PostValidateFn) {
  postValidateFns.push(f)
}

export class VACError extends Error {
  public context: VACContext
  public errors: VACErrorItem[]

  constructor(context: VACContext) {
    super("easy-vac found errors in " + context.errors.map(x => x.label).join(", "))
    this.errors = context.errors.slice()
    this.context = context
  }
}

export class VACContext {
  /** root incoming data */
  root: any;
  stack: VProp[] = [];
  errors: VACErrorItem[] = [];

  operateRoot<T>(type: VType<T>, meta: VPropMetas, incoming: any): T {
    if (this.stack.length > 0) throw new Error("context already has root")

    var result: T
    const vprop: VProp = { label: "root", type, ...meta }

    this.root = incoming
    this.stack.push(vprop)

    try {
      result = type.vac(incoming, vprop)
      this.postValidate_(result, vprop);
    } catch (error) {
      this.pushError_(error)
    }

    currentCtx = null // current context's mission is finished

    if (this.errors.length > 0) {
      throw new VACError(this)
    }

    return result
  }

  operate<T>(label: string | number, vprop: VProp, fn: (vtype: VType<T>, vprop: VPropMetas) => T) {
    if (this.stack.length == 0) throw new Error("context has no root")

    vprop = { label, ...vprop }

    this.stack.push(vprop)
    try {
      const vtype = vprop.type && getVType<T>(vprop.type)
      const result = fn(vtype, vprop)
      this.postValidate_(result, vprop);
    } catch (error) {
      this.pushError_(error)
    }
    this.stack.pop()
  }

  private pushError_(error: Error) {
    const label = this._dumpLabelExpr()
    this.errors.push({
      error,
      label,
      labelParts: this.stack.map(x => x.label),
      message: label + ": " + error
    })
  }

  private postValidate_<T>(result: T, vprop: VProp) {
    if (result !== void 0) {
      for (let i = 0; i < postValidateFns.length; i++) {
        const fn = postValidateFns[i];
        fn(result, vprop, this);
      }
    }
  }

  private _dumpLabelExpr() {
    var stack = this.stack.slice()
    var ans = String(stack.shift().label)
    stack.forEach(it => {
      var label = it.label
      if (typeof label === 'number') ans += `[${label}]`
      else ans += `.${label}`
    })
    return ans
  }
}

let currentCtx: VACContext

export default function getVACContext() {
  if (!currentCtx) currentCtx = new VACContext()
  return currentCtx
}
