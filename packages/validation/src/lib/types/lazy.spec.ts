import { LuftArray } from "./array";
import { LuftObject } from "./object";
import { LuftString } from "./string";
import { LuftLazy } from "./lazy";
import { LuftInfer, LuftNull, LuftType, UnsuccessfulParsingResult } from "./base-types";

const PostFileMetadata = new LuftObject({
  type: {
    description: new LuftString(),
  },
});

type PostMetadataType = LuftType<{
  description: string;
  children: PostMetadataType[];
}>;

const PostMetadata: PostMetadataType = PostFileMetadata.merge({
  // Information about the whereabouts of the post
  children: new LuftArray({
    type: new LuftLazy(() => PostMetadata),
  }),
});
type PostMetadata = LuftInfer<typeof PostMetadata>;

test("LazyType: basic validate", () => {
  const validator = new LuftLazy(() => new LuftString());
  expect(validator.validateSave("test").success).toBe(true);
  expect(validator.validateSave(1).success).toBe(false);
});

test("LazyType: basic coerce", () => {
  const validator = new LuftLazy(() => new LuftNull());
  expect(validator.coerceSave(undefined).success).toBe(true);
  expect(validator.coerceSave(1).success).toBe(false);
});

test("LazyType: recursive type", () => {
  const validationResult = PostMetadata.validate({
    description: "test0",
    children: [
      {
        description: "test1",
        children: [
          {
            description: "test2",
            children: [],
          },
        ],
      },
    ],
  });
  expect(validationResult).toEqual({
    description: "test0",
    children: [
      {
        description: "test1",
        children: [
          {
            description: "test2",
            children: [],
          },
        ],
      },
    ],
  });

  const validationResult2 = PostMetadata.validateSave({
    description: "test0",
    children: [
      {
        description: "test1",
        children: [
          {
            children: [],
            description: 1,
          },
        ],
      },
    ],
  });
  expect(validationResult2.success).toBe(false);
  expect((validationResult2 as UnsuccessfulParsingResult).issues).toEqual([
    {
      message: "Expected string, but got int",
      code: "INVALID_TYPE",
      path: ["children", 0, "children", 0, "description"],
      expectedType: ["string"],
      receivedType: "int",
    },
  ]);
});
