// require("dotenv").config()
// const express = require("express")
// const port = process.env.PORT || 3000
// const app = express()
// const jwt = require("jsonwebtoken")
// const cors = require("cors")
// const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY)
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// app.use(cors())
// app.use(express.json())
// // verify jwt token 
// const verifyToken = (req, res, next) => {
//   const authorization = req.headers.authorization
//   if(!authorization) {
//      return res.status(401).send({error: true, message: "unauthorized access"})
//   }

//   const token = authorization.split(' ')[1]
//   jwt.verify(token, process.env.SECKRET_KEY, (error, decoded) => {
//       if(error) {
//          return res.status(401).send({error: true, message: "unauthorized access"})
//       }
//       req.decoded = decoded
//       next()
//   })
// }


// const uri = process.env.DB_URI;


// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {

//     await client.connect();
//     const db = client.db("instro_learn_camp")
//     const users_collection = db.collection("users")
//     const instructors_collection = db.collection("instructors")
//     const classes_collection = db.collection("classes")
//     const seleted_collection = db.collection("seleted_classes")
//     const payments_collection = db.collection("payments")
//     const enrolled_collection = db.collection("enrolled_classes")


//     // verify admin 
//     const verityAdmin = async (req, res, next) => {
//       const email = req.decoded.email
//       const user = await users_collection.findOne({email: email})
//       if(user?.role !== "admin") {
//           return res.status(401).send({error: true, message: "unauthorized access"})
//       }
//           next()
      
//     }

//     const verityInstructor = async (req, res, next) => {
//       const email = req.decoded.email
//       const user = await users_collection.findOne({email: email})
//       if(user?.role !== "instructor") {
//           return res.status(401).send({error: true, message: "unauthorized access"})
//       }
//           next()
      
//     }
//     app.get("/", (req, res) => {
//         res.send("camp is running")
//     })
//     app.post("/jwt", (req, res) => {
//         const email = req.query.email
//         const token = jwt.sign({
//             email: email,
//         }, process.env.SECKRET_KEY, { expiresIn: '10h' })
//         res.send({token}) 
//     })

//     // checking authorization 
//     app.get("/authorization", async (req, res) => {
//       const email = req.query.email 
//       const user = await users_collection.findOne({email: email})
//       if(user) {
//         res.send({role: user?.role}) 
//       }
//     })

//     // users requests

//     app.put("/add-user", async (req, res) => {
//       const userData = req.body
//       const email = req.query.email
//       const filter = {
//         email: email
//       }
//       const user = {
//         $set: {
//           name: userData?.name,
//           email: userData?.email,
//           photo_url: userData?.photo_url,
//         }
//       }
//       const options = { upsert: true };
//       const result = await  users_collection.updateOne(filter, user, options)
//       res.send(result)

//     })

//     // instructors requests 
//     app.get("/instructors", async (req, res) => {
//       const instructors = await instructors_collection.find().toArray()
//       res.send(instructors)
//     })

//     // classes requests 
//     app.get("/classes", async (req, res) => {
//        const classStatus = req.query.status
//        const filter = classStatus === "all" ? {} : {status: classStatus}
//        const classes = await classes_collection.find(filter).toArray()
//        res.send(classes)
//     })

//     app.post("/add-class", verifyToken, verityInstructor, async (req, res) => {
//       const data = req.body 
//       const newClass = {
//         class_name : data.class_name,
//             class_image : data.class_image,
//             instructor_name : data.instructor_name,
//             instructor_email : data.instructor_email,
//             avilable_seats : parseFloat(data.avilable_seats),
//             price : parseFloat(data.price),
//       }

//       const result = await classes_collection.insertOne(newClass)
//       res.send(result)
//     })

//     app.get("/my-classes", verifyToken, verityInstructor, async(req, res) => {
//         const email = req?.query?.email
//         const result = await classes_collection.find({instructor_email: email}).toArray()
//         res.send(result)
//     })


//     // admin page req 
//     app.get("/users", verifyToken, verityAdmin ,async (req, res) => {
//       const result = await users_collection.find().toArray()
//         res.send(result)
//     })


//     app.post("/select-class", verifyToken, async(req, res) => {
//       const singleClass = req.body

//       const addToClass = {
//         class_id: singleClass.class_id,
//         class_name : singleClass.class_name,
//         class_image : singleClass.class_image,
//         instructor_name : singleClass.instructor_name,
//         instructor_email : singleClass.instructor_email,
//         price : singleClass.price,
//         email: singleClass.email
//     }

//         const result = await seleted_collection.insertOne(addToClass)
//         res.send(result)
//     })


//     app.get("/selected-classes", verifyToken, async(req, res) => {
//       const email = req?.query?.email
//         const result = await seleted_collection.find({email: email}).toArray()
//         res.send(result)
//     })

//     app.get("/enrolled-classes", verifyToken, async(req, res) => {
//       const email = req?.query?.email
//         const result = await enrolled_collection.find({email: email}).toArray()
//         res.send(result)
//     })

    
//     app.delete("/delete-selected-class/:id", verifyToken, async (req, res) => {
//       const id = req.params.id 
//       const result = await seleted_collection.deleteOne({_id: new ObjectId(id)})
//       res.send(result)
//     })

//     // payments 
//     app.post('/create-payment-intent', verifyToken, async (req, res) => {
//       const { price } = req.body;
//       const amount = parseInt(price * 100);
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: amount,
//         currency: 'usd',
//         payment_method_types: ['card']
//       });

//       res.send({
//         clientSecret: paymentIntent.client_secret
//       })
//     })


//     app.post('/payments', verifyToken, async (req, res) => {
//       const payment = req.body;
//       const insertResult = await payments_collection.insertOne(payment);
//       const query = { _id: { $in: payment.selectedClasses.map(id => new ObjectId(id)) } }
//       const deleteResult = await seleted_collection.deleteMany(query)
//       const classesQuery = {_id: {$in: payment.classes.map(classId => new ObjectId(classId))}}
//       const paidClasses = await classes_collection.find(classesQuery).toArray()
//       await enrolled_collection.insertMany(paidClasses)
//       res.send({ insertResult, deleteResult });
//     })

//     app.get("/payment-history", verifyToken, async (req, res) => {
//       const email = req?.query?.email
//       const result = await payments_collection.find({email: email}).toArray()
//       res.send(result)
//     })


//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");

//   } catch(error) {
//     console.log(error)
//   }
// }
// run().catch(console.dir);