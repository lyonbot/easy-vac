import { addPostValidateFn } from "../vcontext";

// Allow additional verifying function for each field

declare module "../core" {
  interface VPropMetas {
    /**
     * when data is validated & cleaned, you may do extra validation.
     * if field's value is bad, this function shall throw an `Error`.
     *
     * @param data the data in correct type and form
     * @param meta meta info for this field
     */
    verify?(data: any, meta: VPropMetas): void
  }
}

addPostValidateFn((result, vprop) => {
  if (typeof vprop.verify === 'function') vprop.verify(result, vprop)
})
