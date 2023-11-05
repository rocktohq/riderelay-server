const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Default Route
app.get("/", (req, res) => {
  res.send("RideRelay Server is running...");
});

// * MongoDB COnfigurations
// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@usermanagement.n4peacj.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // * Collections
    const serviceCollection = client.db("rideRelay").collection("services");
    const bookingCollection = client.db("rideRelay").collection("bookings");

    // * Get APIs
    // Get Services
    app.get("/api/v1/services", async (req, res) => {
      try {
        let query = {};
        const cursor = serviceCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });

    // Get a Single Service
    app.get("/api/v1/services/:serviceId", async (req, res) => {
      try {
        const id = req.params.serviceId;
        const query = { _id: new ObjectId(id) };
        const result = await serviceCollection.findOne(query);
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });

    // Get Bookings
    app.get("/api/v1/bookings", async (req, res) => {
      try {
        let query = {};
        const cursor = bookingCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });

    // Get a Single Booking
    app.get("/api/v1/bookings/:bookingId", async (req, res) => {
      try {
        const id = req.params.bookingId;
        const query = { _id: new ObjectId(id) };
        const result = await bookingCollection.findOne(query);
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });

    // * Post APIs
    // Create a Service
    app.post("/api/v1/add-new-service", async (req, res) => {
      try {
        const service = req.body;
        const result = await serviceCollection.insertOne(service);
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });

    // Book a Service
    app.post("/api/v1/book-a-service", async (req, res) => {
      try {
        const service = req.body;
        const result = await bookingCollection.insertOne(service);
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });

    // * Update APIs
    // Update a Service
    app.put("/api/v1/update-service/:serviceId", async (req, res) => {
      try {
        const id = req.params.serviceId;
        const service = req.body;
        const query = { _id: new ObjectId(id) };
        const options = {};
        const updatedService = {
          $set: {
            ...service,
          },
        };
        const result = await serviceCollection.updateOne(
          query,
          updatedService,
          options
        );
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });

    // Update a Booking
    app.put("/api/v1/update-booking/:bookingId", async (req, res) => {
      try {
        const id = req.params.bookingId;
        const booking = req.body;
        const query = { _id: new ObjectId(id) };
        const options = {};
        const updatedBooking = {
          $set: {
            ...booking,
          },
        };
        const result = await bookingCollection.updateOne(
          query,
          updatedBooking,
          options
        );
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Listeners
app.listen(port, () => {
  console.log(`RideRelay Server is running on port ${port}`);
});
