import { array, LuftInfer, object, string } from "@luftschloss/validation";

export const CreateUrlModel = object({
  url: string(),
});

export type CreateUrlModel = LuftInfer<typeof CreateUrlModel>;

export const UrlModel = object({
  url: string(),
  id: string(),
});
export type UrlModel = LuftInfer<typeof UrlModel>;

export const IDs = array(string());
