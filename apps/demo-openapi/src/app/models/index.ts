import { array, int, LuftInfer, object, string } from "@luftschloss/validation";

export const CreateUrlModel = object({
  url: string(),
});

export type CreateUrlModel = LuftInfer<typeof CreateUrlModel>;

export const UrlModel = object({
  url: string(),
  id: int(),
});
export type UrlModel = LuftInfer<typeof UrlModel>;

export const UrlModels = array(UrlModel);
export type UrlModels = LuftInfer<typeof UrlModels>;

export const IdPath = object({
  id: int().parseString(true),
});
export type IdPath = LuftInfer<typeof IdPath>;
