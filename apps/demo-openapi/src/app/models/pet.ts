import { array, int, literal, object, string } from "@luftschloss/validation"
import { Category, Tag } from "./common"

export const Pet = object({
  id: int().positive(),
  name: string(),
  category: Category,
  photoUrls: array(string()),
  tags: array(Tag),
  status: literal(["available", "pending", "sold"]),
}).named("Pet")
