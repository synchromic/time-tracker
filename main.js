import "dotenv/config";
import express from "express";
import cookieSession from "cookie-session";
import bodyParser from "body-parser";
import crypto from "node:crypto";

const app = express();
const port = 80;

app.use(cookieSession({
  secret: process.env.COOKIE_SECRET,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 1 month
}));

app.use(bodyParser.urlencoded());
app.use(express.static("static"));

app.get("/", (req, res) => {
  res.sendFile("static/index.html");
});

const adminSalt = Buffer.from(process.env.ADMIN_SALT, "base64");
app.post("/api/login", (req, res) => {
  crypto.pbkdf2(req.body.password, adminSalt, 10000, 64, "sha512", (err, derivedKey) => {
    if (err) {
      res.redirect(400, "/");
    } else if (derivedKey.toString("base64") === process.env.ADMIN_HASH) {
      req.session.loggedIn = true;
      res.redirect("/");
    } else {
      res.redirect(401, "/");
    }
  });
});

app.post("/api/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/api/logincheck", (req, res) => {
  res.send({ loggedIn: req.session.loggedIn ?? false });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
