require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// Middleware//
app.use(
  cors({
    origin: [
      "https://prb9-a11.netlify.app",
      "http://localhost:8000",
      "https://prb9-a11.web.app",
      "https://prb9-a11.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// extraa middlewares
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.plfcipz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const cookieOption = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

async function run() {
  try {
    // await client.connect();

    // Jwt added here
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, cookieOption);
      res.send({ Success: true });
    });
    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("logging out", user);
      res.clearCookie("token", { ...cookieOption, maxAge: 0 });
      res.send({ success: true });
    });

    const AllData = client.db("PRB9-A11").collection("All");
    // All Data
    app.get("/all", verifyToken, async (req, res) => {
      const cursor = AllData.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //  ADD books in All
    app.post("/all", verifyToken, async (req, res) => {
      const add = req.body;
      const result = await AllData.insertOne(add);
      res.send(result);
    });
    // update added books
    app.patch("/all/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBook = req.body;
      const updateDoc = {
        $set: updateBook,
      };
      const result = await AllData.updateOne(filter, updateDoc);
      res.send(result);
    });
    // UpdateBook Quanity when return
    app.patch("/all/incr/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $inc: { quantity: 1 },
      };
      const result = await AllData.updateOne(filter, updateDoc);
      res.send(result);
    });
    // UpdateBook Quanity when borrow
    app.patch("/all/decr/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $inc: { quantity: -1 },
      };
      const result = await AllData.updateOne(filter, updateDoc);
      res.send(result);
    });

    const Borrowed = client.db("PRB9-A11").collection("Borrowed");
    // BorrowED
    app.get("/borrowed", verifyToken, async (req, res) => {
      if (req.query?.email !== req.user?.email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await Borrowed.find(query).toArray();
      res.send(result);
    });

    app.post("/borrowed", async (req, res) => {
      const borrow = req.body;
      const result = await Borrowed.insertOne(borrow);
      res.send(result);
    });

    app.delete("/borrowed/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await Borrowed.deleteOne(query);
      res.send(result);
    });
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port : ${port}`);
});
