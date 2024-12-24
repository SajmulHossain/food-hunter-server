const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();
const port = process.env.port || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.saftd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const foodCollection = client.db("foodDB").collection("foods");

    // token related api

    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_KEY, {
        expiresIn: "2h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true, token });
    });

    // clear cookie when logout
    app.get("/logout", async (req, res) => {
      res
        .clearCookie("token", {
          maxAge: 0,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // food get post put

    app.get("/foods", async (req, res) => {
      const result = await foodCollection.find().toArray();
      res.send(result);
    });

    app.post("/foods", async (req, res) => {
      const data = req.body;
      const result = await foodCollection.insertOne(data);
      res.send(result);
    });

    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    app.get("/foods/:email", async (req, res) => {
      const email = req.params.email;
      const query = { donatorEmail: email };
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/food/update/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const option = { upsert: true };
      const query = { _id: new ObjectId(id) };
      const updatedData = {
        $set: data,
      };

      const result = await foodCollection.updateOne(query, updatedData, option);
      res.send(result);
    });

    await client.connect();
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
  res.send(`Food server is running`);
});

app.listen(port, () => {
  console.log(`Sever is running in in port: ${port}`);
});
