import { luft } from "./factories"
import {
  LuftAny,
  LuftArray,
  LuftDate,
  LuftInt,
  LuftLiteral,
  LuftNever,
  LuftNumber,
  LuftObject,
  LuftRecord,
  LuftRegexp,
  LuftString,
  LuftTuple,
  LuftUUIDString,
} from "./types"

test("Test if different factories return the same as the default constructor", () => {
  expect(luft.any()).toStrictEqual(new LuftAny())
  expect(luft.array(luft.string())).toStrictEqual(new LuftArray({ type: new LuftString() }))
  expect(luft.date()).toStrictEqual(new LuftDate())
  expect(luft.int()).toStrictEqual(new LuftInt())
  expect(luft.literal(["a", "b", false])).toStrictEqual(new LuftLiteral({ types: ["a", "b", false] }))
  expect(luft.never()).toStrictEqual(new LuftNever())
  expect(luft.number()).toStrictEqual(new LuftNumber())
  expect(luft.object({ hello: luft.string() })).toStrictEqual(new LuftObject({ type: { hello: new LuftString() } }))
  expect(luft.record(luft.string(), luft.number())).toStrictEqual(
    new LuftRecord({ key: new LuftString(), value: new LuftNumber() })
  )
  expect(luft.regex(/\d/)).toStrictEqual(new LuftRegexp({ regex: /\d/ }))
  expect(luft.string()).toStrictEqual(new LuftString())
  expect(luft.tuple([luft.string(), luft.number()])).toStrictEqual(
    new LuftTuple({ types: [new LuftString(), new LuftNumber()] })
  )
  expect(luft.uuid()).toStrictEqual(new LuftUUIDString())
})
