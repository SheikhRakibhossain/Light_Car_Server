const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var jwt = require("jsonwebtoken");

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
//test token generate system
app.post("/gen-jwt", (req, res) => {
  const user = req.body;
  console.log({ user });
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "3h",
  });
  res.send({ token });
});
//jwt auth verify
app.post("/jwt", (req, res) => {
  const body = req.body;
  console.log({ body });
  const token = jwt.sign(body, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "2h",
  });
  res.send({ token });
});

const verifyjwt = (req, res, next) => {
  const authorization = req.headers.authorization;
  console.log(headers);
  console.log(authorization);
  if (!authorization) {
    return res.status(401).send({ error: true, message: "Unaithorize access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .send({ err: true, message: "user access forbidden" });
    }
    req.decoded = decoded;
    console.log(decoded);
    console.log(req.decoded);
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("car").collection("services");
    const checkoutCollection = client.db("car").collection("checkout");
    const projectCollection = client.db("car").collection("success");

    // token api for valid auth
    app.post("/jwt", (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    //service api for cleint view
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
    app.get("/checkout", verifyjwt, async (req, res) => {
      console.log(req.headers.authorization);
      const decoded = req.decoded;
      console.log("come back decoded", decoded);
      console.log(decoded.email);
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ error: 1, message: "forbidden access" });
      }

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
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updatedCheckout.status,
        },
      };
      console.log(updatedCheckout);
      const result = await checkoutCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //delete checkout booking data api
    app.delete("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await checkoutCollection.deleteOne(query);
      res.send(result);
    });

    //car services completed projects related api
    app.get('/completed-projects', async(req, res)=>{
      const result = await projectCollection.find().toArray();
      res.send(result);

    })
//filter api for review orderd
app.post('/booked',async()=>{

const body = req.body;
console.log(body)
})
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

//captcha function



app.get("/", (req, res) => {
  res.send("Light Car Server is running on there or here..!");
});

app.listen(port, (req, res) => {
  console.log(`server is running on ${port}`);
});
