import { Status } from "@luftschloss/server";
import { int, luft, LuftInfer, object, string } from "@luftschloss/validation";

export const Category = object({
  name: string(),
  id: int().positive(),
}).named("Category");
export type Category = LuftInfer<typeof Category>;

export const Tag = object({
  name: string(),
  id: int().positive(),
}).named("Tag");
export type Tag = LuftInfer<typeof Tag>;

export const NotFound = object({
  message: luft.string(),
})
  .named("NotFound")
  .status(Status.HTTP_404_NOT_FOUND);
