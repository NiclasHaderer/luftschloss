import { array, LuftInfer, object, string, url } from "@luftschloss/validation";

const _url = url().protocol(["http:", "https:"]);

export const CreateUrlModel = object({
  url: _url,
});

export type CreateUrlModel = LuftInfer<typeof CreateUrlModel>;

export const UrlModel = object({
  url: _url,
  id: string().max(5).min(5),
});
export type UrlModel = LuftInfer<typeof UrlModel>;

export const UrlModels = array(UrlModel);
export type UrlModels = LuftInfer<typeof UrlModels>;

export const IdPath = object({
  id: string().max(5).min(5),
});
export type IdPath = LuftInfer<typeof IdPath>;
