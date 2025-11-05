import express from "express";

const app = express();
const port = 3000;

app.use(express.static("static"));

app.get("/", (req, res) => {
  res.sendFile("static/index.html");
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})
