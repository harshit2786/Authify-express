import express from "express";
import "dotenv/config";
import { getToken, getUrl } from "./helper.js";

const app = express();
app.get("/v1/auth", async (req, res) => {
  const id = req.query.id;
  const script = `
        <script>
          window.close();
        </script>
      `;
  try{
    const authurl = await getUrl(id);
    if(!authurl || typeof authurl !== "string"){
      res.send(script);
    };
    res.redirect(authurl);
  }
  catch(e){
    console.log("Error:",e);
    res.send(script);
  }
});

app.get("/callback/microsoft", async (req, res) => {
  const code = req.query.code;
  const id = req.query.state;
  const resp = await getToken(code,id,"microsoft");

  if (!resp) {
    return res.status(400).send("Error");
  }
  console.log("resp",resp)
  const script = `
        <script>
          window.opener.postMessage(${JSON.stringify(resp)}, '*');
          window.close();
        </script>
      `;
    res.send(script);
});

app.get("/callback/github", async (req, res) => {
  const code = req.query.code;
  const id = req.query.state;
  const resp = await getToken(code,id,"github");

  if (!resp) {
    return res.status(400).send("Error");
  }
  console.log("resp",resp)
  const script = `
        <script>
          window.opener.postMessage(${JSON.stringify(resp)}, '*');
          window.close();
        </script>
      `;
    res.send(script);
});


app.get("/callback/google", async (req, res) => {
  const code = req.query.code;
  const id = req.query.state;
  const resp = await getToken(code,id,"google");

  if (!resp) {
    return res.status(400).send("Error");
  }
  console.log("resp",resp)
  const script = `
        <script>
          window.opener.postMessage(${JSON.stringify(resp)}, '*');
          window.close();
        </script>
      `;
    res.send(script);
});

app.listen(process.env.PORT, () => console.log(`Running on port ${process.env.PORT}`));
