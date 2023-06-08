const express = require('express');
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 9999;
const app = express();

app.use(cors());
app.use(express.json());



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

        // Instructor
        app.get('/instructor', async (req, res) => {
            const instructor = await instructorCollection.find().toArray();
            res.send(instructor);
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