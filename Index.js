const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ncskwvc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    const userCollection = client.db("bistrodb").collection("users")
    const menuCollection = client.db("bistrodb").collection("menu")
    const reviewsCollection = client.db("bistrodb").collection("reviews")
    const cartsCollection = client.db("bistrodb").collection("carts")

    // all method here

    // users related api

    // posting user doc
    app.post( '/users', async( req, res ) => {
      const user = req.body;
      // insert email if user doesnot exist
      // you can do this in many ways( 1.email unique, 2.upsert, 3. simple checking)
      const query = { email: user.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        return res.send({ message: 'user  already exist', insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })
    
    // getting all the user data
    app.get( '/users', async( req, res ) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })



// cart collection 
    // posting new cart in cart collection
    app.post( '/carts', async( req, res ) => {
      const cartItem = req.body;
      console.log(cartItem)
      const result = await cartsCollection.insertOne(cartItem);
      res.send( result )
    })
    
    // getting data from cart collection
    app.get( '/carts', async( req, res ) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await cartsCollection.find( query ).toArray();
      res.send(result)
    })

    // for deleting item from the cart
    app.delete( '/carts/:id', async( req, res ) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await cartsCollection.deleteOne(query);
      res.send(result)
    })



    // admin related code 


    // to delete user from the dashboard
    app.delete( '/users/:id', async( req, res ) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await userCollection.deleteOne(query)
      res.send( result )
    })


    // 
    app.patch('/users/admin/:id', async( req, res ) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const options = {
        upsert: true
      }
      const updatedDoc={
        $set:{
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter,updatedDoc,options)
      res.send(result)
    })

    // menu related apis
    app.get( '/menu', async( req, res ) => {
        const result = await menuCollection.find().toArray();
        res.send(result)
    })
    app.get( '/reviews', async( req, res ) => {
        const result = await reviewsCollection.find().toArray();
        res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', ( req, res ) => {
    res.send('boss is sitting')
})

app.listen(port , () => {
    console.log(`bistro boss is sitting on ${port}`)
})