import { deepCopy } from "./deep-copy";
import { deepEquals } from "./deep-equals";

test("DeepEqual: null and null are equal", () => {
  expect(deepEquals(null, null)).toBe(true);
});

test("DeepEqual: null and undefined are not equal", () => {
  expect(deepEquals(null, undefined)).toBe(false);
});

test("DeepEqual: equal function dealing with nullable", () => {
  expect(
    deepEquals(
      {
        hello: {
          world: {
            how: false,
          },
        },
      },
      {
        hello: null,
      }
    )
  ).toBe(false);
});

test("DeepEqual: primitives are equal", () => {
  expect(deepEquals("my string", "my string")).toBe(true);
  expect(deepEquals(1, "my string")).toBe(false);
  expect(deepEquals(1, "my string")).toBe(false);
});

test("DeepEqual: complex object", () => {
  const largeJson = {
    feeds: [
      {
        id: 2140,
        title: "gj",
        description: "ghj",
        location: "Hermannplatz 5-6, 10967 Berlin, Germany",
        lng: 0,
        lat: 0,
        userId: 4051,
        name: "manoj",
        isdeleted: false,
        profilePicture: "Images/9b291404-bc2e-4806-88c5-08d29e65a5ad.png",
        videoUrl: null,
        images: null,
        mediatype: 0,
        imagePaths: null,
        feedsComment: null,
        commentCount: 0,
        multiMedia: [
          {
            id: 3240,
            name: "",
            description: null,
            url: "http://www.youtube.com/embed/mPhboJR0Llc",
            mediatype: 2,
            likeCount: 0,
            place: null,
            createAt: "0001-01-01T00:00:00",
          },
        ],
        likeDislike: { likes: 0, dislikes: 0, userAction: 2 },
        createdAt: "2020-01-02T13:32:16.7480006",
        code: 0,
        msg: null,
      },
      {
        id: 2139,
        title: "dfg",
        description: "df",
        location: "443 N Rodeo Dr, Beverly Hills, CA 90210, USA",
        lng: 0,
        lat: 0,
        userId: 4051,
        name: "manoj",
        isdeleted: false,
        profilePicture: "Images/9b291404-bc2e-4806-88c5-08d29e65a5ad.png",
        videoUrl: null,
        images: null,
        mediatype: 0,
        imagePaths: null,
        feedsComment: null,
        commentCount: 2,
        multiMedia: [
          {
            id: 3239,
            name: "",
            description: null,
            url: "http://www.youtube.com/embed/RtFcZ6Bwolw",
            mediatype: 2,
            likeCount: 0,
            place: null,
            createAt: "0001-01-01T00:00:00",
          },
        ],
        likeDislike: { likes: 0, dislikes: 0, userAction: 2 },
        createdAt: "2020-01-02T10:54:07.6092829",
        code: 0,
        msg: null,
      },
    ],
  };
  expect(deepEquals(largeJson, deepCopy(largeJson))).toBe(true);
});
