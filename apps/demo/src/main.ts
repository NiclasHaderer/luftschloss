import { defaultServer } from "@luftschloss/server";
import { luftClient } from "@luftschloss/client";
import { bufferParser, formParser, jsonParser, textParser } from "@luftschloss/body";


const createServer = () => {
  const server = defaultServer().pipe(jsonParser("*"), formParser("*"), bufferParser("*"), textParser("*"));
  server.get("/json", (req, res) => res.json({ hello: "world" }));
  server.get("/text", (req, res) => res.text("hello world"));
  server.get("/redirect", (req, res) => res.redirect("http://127.0.0.1:33333/json", "307_TEMPORARY_REDIRECT"));
  server.get("/2-redirects", (req, res) => res.redirect("http://127.0.0.1:33333/redirect", "307_TEMPORARY_REDIRECT"));
  server.get("/redirect-external", (req, res) => res.redirect("https://google.com", "307_TEMPORARY_REDIRECT"));
  server.get("/buffer", (req, res) => res.buffer(Buffer.from("hello world")));
  server.get("/error/{statusCode:int}", (req, res) =>
    res
      .status(req.pathParams<{ statusCode: number }>().statusCode)
      .json({ error: req.pathParams<{ statusCode: number }>().statusCode })
  );
  server.post("/echo-json", async (req, res) => res.json(await req.json()));
  server.post("/echo-text", async (req, res) => {
    const text = await req.text();
    res.text(text);
  });
  server.post("/echo-binary", async (req, res) => {
    const buffer = await req.buffer().then(b => b.buffer);
    res.buffer(buffer);
  });
  server.post("/echo-form", async (req, res) => {
    const form = await req.form();
    res.form(form);
  });

  return server;
};

const main = async () => {
  const client = luftClient();
  const server = createServer();
  void server.listen(33333);
  await server.onComplete("startupComplete");


  const response = await client.get("http://127.0.0.1:33333/text").send();
  console.log(response.status);
  console.log(await response.text());
  await server.shutdown();
};
void main();
