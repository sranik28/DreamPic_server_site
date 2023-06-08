const express = require('express');
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 9999;
const app = express();

app.use(cors());
app.use(express.json());

// verify jwt token 
const verifyToken = (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).send({ error: true, message: "unauthorized access" })
    }

    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.SECKRET_KEY, (error, decoded) => {
        if (error) {
            return res.status(401).send({ error: true, message: "unauthorized access" })
        }
        req.decoded = decoded
        next()
    })
}


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.ngcynwn.mongodb.net/?retryWrites=true&w=majority`;

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

        // collections to mongodb 
        const classesCollection = client.db("dreamPic").collection("classes");
        const instructorCollection = client.db("dreamPic").collection("instructor");
        const usersCollection= client.db("dreamPic").collection("users");

        const verityInstructor = async (req, res, next) => {
            const email = req.decoded.email
            const user = await users_collection.findOne({ email: email })
            if (user?.role !== "instructor") {
                return res.status(401).send({ error: true, message: "unauthorized access" })
            }
            next()

        }

        app.post("/jwt", (req, res) => {
            const email = req.query.email
            const token = jwt.sign({
                email: email,
            }, process.env.SECKRET_KEY, { expiresIn: '10h' })
            res.send({token}) 
        })

        app.get("/authorization", async (req, res) => {
            const email = req.query.email 
            const user = await usersCollection.findOne({email: email})
            if(user) {
              res.send({role: user?.role}) 
            }
          })

          app.put("/add-user", async (req, res) => {
            const userData = req.body
            const email = req.query.email
            const filter = {
              email: email
            }
            const user = {
              $set: {
                name: userData?.name,
                email: userData?.email,
                photo_url: userData?.photo_url,
              }
            }
            const options = { upsert: true };
            const result = await  usersCollection.updateOne(filter, user, options)
            res.send(result)
      
          })

        // classes api
        app.get('/classes', async (req, res) => {
            const classes = await classesCollection.find().sort({
                student_enroll: -1
            }).toArray();
            res.send(classes);
        })

        app.get('/top-classes', async (req, res) => {
            const classes = await classesCollection.find().limit(6).sort({
                student_enroll: -1
            }).toArray();
            res.send(classes);
        })

        app.get("/my-classes", verifyToken, verityInstructor, async(req, res) => {
            const email = req?.query?.email
            const result = await classesCollection.find({instructor_email: email}).toArray()
            res.send(result)
        })

        // Instructor api
        app.get('/instructor', async (req, res) => {
            const instructor = await instructorCollection.find().toArray();
            res.send(instructor);
        })


        app.post("/add-class", verifyToken, verityInstructor, async (req, res) => {
            const data = req.body
            const newClass = {
                class_name: data.class_name,
                class_image: data.class_image,
                instructor_name: data.instructor_name,
                instructor_email: data.instructor_email,
                avilable_seats: parseFloat(data.avilable_seats),
                price: parseFloat(data.price),
            }

            const result = await classesCollection.insertOne(newClass)
            res.send(result)
        })

        app.post("/select-class", verifyToken, async (req, res) => {
            const singleClass = req.body

            const addToClass = {
                class_id: singleClass.class_id,
                class_name: singleClass.class_name,
                class_image: singleClass.class_image,
                instructor_name: singleClass.instructor_name,
                instructor_email: singleClass.instructor_email,
                price: singleClass.price,
                email: singleClass.email
            }

            const result = await seleted_collection.insertOne(addToClass)
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


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port)