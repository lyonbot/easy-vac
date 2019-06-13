import { addPostValidateFn } from "../vcontext";
import { VPropMetas } from "../core";

// Bring some JSON Schema 7 features into easy-vac

declare module "../core" {
  interface VPropMetas {
    // https://json-schema.org/understanding-json-schema/reference/string.html
    minLength?: number,
    maxLength?: number,
    pattern?: RegExp,
    // enum ... use VEnum type instead :)
    // format ... is not implemented yet

    // https://json-schema.org/understanding-json-schema/reference/numeric.html
    multipleOf?: number
    minimum?: number
    exclusiveMinimum?: number
    maximum?: number
    exclusiveMaximum?: number

    // https://json-schema.org/understanding-json-schema/reference/object.html
    // use VObject :)

    // https://json-schema.org/understanding-json-schema/reference/array.html
    // Use VTuple and VArray instead :)
  }
}

addPostValidateFn((result, vprop) => {
  const has = <K extends keyof VPropMetas>(k: K) => k in vprop

  if (typeof result === 'string') {
    if (has('minLength') && result.length < vprop.minLength) throw new Error("length too short")
    if (has('maxLength') && result.length > vprop.maxLength) throw new Error("length too long")
    if (has('pattern') && !vprop.pattern.test(result as any)) throw new Error("not match RegExp pattern")
  }

  if (typeof result === 'number') {
    if (has('multipleOf') && result % vprop.multipleOf != 0) throw new Error(`value must be a multiple of ${vprop.multipleOf}`)
    if (has('maximum') && result > vprop.maximum) throw new Error(`value too large`)
    if (has('exclusiveMaximum') && result >= vprop.exclusiveMaximum) throw new Error(`value too large`)
    if (has('minimum') && result < vprop.minimum) throw new Error(`value too small`)
    if (has('exclusiveMinimum') && result <= vprop.exclusiveMinimum) throw new Error(`value too small`)
  }
})
