import { VACData, Required, Optional, IsArrayOf, AssertWith, IsOneOf } from "easy-vac";

declare module "easy-vac" {
  interface FieldInfo {
    lorem?: string
  }
}

export default class MyForm extends VACData {
  @Required name: string
  @Optional comment: string = ""
  @Optional processed: boolean = false

  @IsOneOf(["red", "green", "blue", "yellow", "purple", "pink"])
  @Optional color: string = "red"

  @IsArrayOf(["tag1", "tag2", "tag3", "tag4"], { minLength: 1, maxLength: 3, unique: true })
  @Required tags: string[]

  @AssertWith((t: Date) => t.getHours() >= 10, "Can't be earlier than 10:00 PM")
  @Optional time: Date
}


var data = new MyForm().fillDataWith({
  name: "john",
  tags: ["tag1"],
  time: "2018-12-30 09:59"
})

if (data.hasErrors()) console.error(data.getErrors())
else console.log(data)
