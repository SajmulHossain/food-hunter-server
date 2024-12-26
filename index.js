const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const port = process.env.port || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ph-assignment-11-sajmul.web.app",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }

    req.user = decoded;
  });

  next();
};

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
    const requestCollection = client.db("foodDB").collection("request");

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
      const search = req.query.search;
      const sort = req.query.sort;
      let query = {
        status: "Available",
      };

      if (search) {
        query.foodName = { $regex: search, $options: "i" };
      }

      let sortQuery = {};
      if (sort && sort === "asc") {
        sortQuery = { expiredDate: 1 };
      } else if (sort && sort === "dsc") {
        sortQuery = { expiredDate: -1 };
      } else {
        sortQuery = {};
      }

      const result = await foodCollection.find(query).sort(sortQuery).toArray();
      res.send(result);
    });

    app.get("/featuredFood", async (req, res) => {
      const size = parseInt(req.query.size);
      const result = await foodCollection
        .find()
        .sort({ quantity: -1 })
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.post("/foods", async (req, res) => {
      const data = req.body;
      const result = await foodCollection.insertOne(data);
      res.send(result);
    });

    app.get("/food/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    app.get("/foods/:email", verifyToken, async (req, res) => {
      const decodedEmail = req?.user?.email;
      const email = req.params.email;

      if (decodedEmail !== email) {
        return res.status(403).send({ message: "forbidden" });
      }

      const query = { donatorEmail: email };
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/food/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      const deleteRequest = await requestCollection.deleteOne({ foodId: id });
      res.send(result);
    });

    app.put("/food/update/:id", verifyToken, async (req, res) => {
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

    // request food related api
    app.get("/requests", verifyToken, async (req, res) => {
      const decodedEmail = req?.user?.email;
      const queryEmail = req.query.email;

      if (decodedEmail !== queryEmail) {
        return res.status(403).send({ message: "unauthorized access" });
      }

      const query = { userEmail: queryEmail };
      const requests = await requestCollection.find(query).toArray();

      if (requests.length) {
        for (const request of requests) {
          const query = { _id: new ObjectId(request.foodId) };
          const food = await foodCollection.findOne(query);

          if (food) {
            request.donatorName = food.donatorName;
            request.expiredDate = food.expiredDate;
            request.location = food.location;
            request.foodName = food.foodName;
          }
        }
      }

      res.send(requests);
    });

    app.post("/food/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const updatedStatus = {
        $set: {
          status: "Requested",
        },
      };
      const result = await foodCollection.updateOne(query, updatedStatus);

      const data = req.body;
      const result2 = await requestCollection.insertOne(data);
      res.send({ result, result2 });
    });

    // await client.connect();
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
  res.send(`Food server is running`);
});

app.listen(port, () => {
  console.log(`Sever is running in in port: ${port}`);
});
