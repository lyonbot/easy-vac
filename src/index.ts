import { ST2T } from "./core"
export { VPropMetas, VTypeDict } from "./core"
export { VType, isVType } from "./core"

/**
 * extract corresponding JavaScript type info from a VType
 *
 * @example
 *      const UserInfo = VObject({
 *        name: { type: String },
 *        age: { type: "int" }
 *      })
 *
 *      // type UserInfoType is { name: string, age: number }
 *      type UserInfoType = VACResultType<typeof UserInfo>
 *
 *      // TypeScript will report Error on property 'age' !!!
 *      // ts(2322): Type 'string' is not assignable to type 'number'
 *      const user1: UserInfoType = { name: "Tony", age: "Whatever" }
 */
export type VACResultType<T> = ST2T<T>

export { VACContext, VACError } from "./vcontext";
export { PostValidateFn, addPostValidateFn } from "./vcontext";

export { default as VObject } from "./vtypes/object";
export { default as VArray } from "./vtypes/array";
export { default as VEnum } from "./vtypes/enum";
export { default as VTuple } from "./vtypes/tuple";

export { define, getVType } from "./vtypes/index";
export * from "./vtypes/makeVType";

/** now install builtin types and extensions */
import "./vtypes/builtin";
import "./extensions/json-schema-rules";
import "./extensions/custom-validate";
