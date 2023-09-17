const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.dracezw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("car").collection("services");
    const checkoutCollection = client.db("car").collection("checkout");

    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { title: 1, img: 1, service_id: 1, price: 1 },
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });
    //checkout page booking data api created
    app.post("/checkout", async (req, res) => {
      const checkout = req.body;
      // console.log(checkout)
      const result = await checkoutCollection.insertOne(checkout);
      res.send(result);
    });

    //get some booking data from checkout
    app.get("/checkout", async (req, res) => {
      // console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await checkoutCollection.find(query).toArray();
      res.send(result);
    });

    //checkout update function has created by using patch
    app.patch("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCheckout = req.body;
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          status: updatedCheckout.status
        },
      };
      console.log(updatedCheckout);
      const result = await checkoutCollection.updateOne(filter, updateDoc)
      res.send(result);


    });

    //delete checkout booking data api
    app.delete("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await checkoutCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Light Car Server is running on there or here..!");
});

app.listen(port, (req, res) => {
  console.log(`server is running on ${port}`);
});
