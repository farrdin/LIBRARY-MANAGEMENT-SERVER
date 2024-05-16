require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// Middleware//
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.plfcipz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const AllData = client.db("PRB9-A11").collection("All");
    // All Data
    app.get("/all", async (req, res) => {
      const cursor = AllData.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    const Borrowed = client.db("PRB9-A11").collection("Borrowed");
    // BorrowED
    app.get("/borrowed", async (req, res) => {
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

    const Add = client.db("PRB9-A11").collection("Add");
    //  Add
    app.get("/add", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await Add.find(query).toArray();
      res.send(result);
    });

    app.post("/add", async (req, res) => {
      const add = req.body;
      const result = await Add.insertOne(add);
      res.send(result);
    });
    app.patch("/add/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBook = req.body;
      console.log(updateBook);
      const updateDoc = {
        $set: updateBook,
      };
      try {
        const result = await Add.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Error updating document:", error);
        res
          .status(500)
          .send({ error: "An error occurred while updating the document." });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
