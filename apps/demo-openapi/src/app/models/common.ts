import { int, LuftInfer, object, string } from "@luftschloss/validation"

export const Category = object({
  name: string(),
  id: int().positive(),
}).named("Category")
export type Category = LuftInfer<typeof Category>

export const Tag = object({
  name: string(),
  id: int().positive(),
}).named("Tag")
export type Tag = LuftInfer<typeof Tag>
