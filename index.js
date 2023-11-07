const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://riderelayhq.web.app"],
    credentials: true,
  })
);

// Token Verification
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) return res.status(401).send({ message: "Unauthorized access" });
  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) return res.status(401).send({ message: "Unauthorized access" });
    req.user = decoded;
    next();
  });
};

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

    // * JWT APIs
    // JWT API
    app.post("/api/v1/auth/access-token", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET, { expiresIn: "24h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 60 * 60 * 24,
        })
        .send({ type: "Token creation", success: true });
    });

    // LogOut API
    app.post("/api/v1/auth/logout", (req, res) => {
      const user = req.body;
      res
        .clearCookie("token", { maxAge: 0 })
        .send({ type: "Logout user", success: true });
    });

    // * Get APIs
    // Get Services
    app.get("/api/v1/services", async (req, res) => {
      try {
        // Sorting
        let sorting = {};
        if (req.query.sortBy === "price" && req.query.sortOrder === "desc") {
          sorting = { price: 1 };
        } else if (req.query.sortBy === "price" && req.query === "asc") {
          sorting = { price: -1 };
        }
        // Query
        let query = {};
        const cursor = serviceCollection.find(query).sort(sorting);
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
    app.get("/api/v1/bookings", verifyToken, async (req, res) => {
      try {
        if (req?.user?.email !== req?.query?.email) {
          res.status(403).send({ message: "Forbidden access" });
          return;
        }

        let query = {};
        const cursor = bookingCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });

    // Get a Single Booking
    app.get("/api/v1/bookings/:bookingId", verifyToken, async (req, res) => {
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
    app.post("/api/v1/add-new-service", verifyToken, async (req, res) => {
      try {
        const service = req.body;
        const result = await serviceCollection.insertOne(service);
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    });

    // Book a Service
    app.post("/api/v1/book-a-service", verifyToken, async (req, res) => {
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
    app.put(
      "/api/v1/update-service/:serviceId",
      verifyToken,
      async (req, res) => {
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
      }
    );

    // Update a Booking
    app.put(
      "/api/v1/update-booking/:bookingId",
      verifyToken,
      async (req, res) => {
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
      }
    );

    // * Delete APIs
    // Delete a Service
    app.delete(
      "/api/v1/delete-service/:serviceId",
      verifyToken,
      async (req, res) => {
        try {
          const id = req.params.serviceId;
          const query = { _id: new ObjectId(id) };
          const result = await serviceCollection.deleteOne(query);
          res.send(result);
        } catch (err) {
          res.send(err);
        }
      }
    );

    // Delete a Booking
    app.delete(
      "/api/v1/delete-booking/:bookingId",
      verifyToken,
      async (req, res) => {
        try {
          const id = req.params.bookingId;
          const query = { _id: new ObjectId(id) };
          const result = await bookingCollection.deleteOne(query);
          res.send(result);
        } catch (err) {
          res.send(err);
        }
      }
    );
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
