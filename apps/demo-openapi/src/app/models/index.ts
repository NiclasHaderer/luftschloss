import { array, int, LuftInfer, object, string } from "@luftschloss/validation";

export const CreateUrlModel = object({
  url: string(),
});

export type CreateUrlModel = LuftInfer<typeof CreateUrlModel>;

export const UrlModel = object({
  url: string(),
  id: string(),
});
export type UrlModel = LuftInfer<typeof UrlModel>;

export const UrlModelDecoded = object({
  url: string(),
  id: int(),
});
export type UrlModelDecoded = LuftInfer<typeof UrlModelDecoded>;

export const IDs = array(string());
