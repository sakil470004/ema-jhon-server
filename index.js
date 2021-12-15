const { MongoClient } = require('mongodb');
const express = require('express');
// for environment variable
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.poyqe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri)
async function run() {


    try {
        await client.connect();
        console.log('db connect shot');
        const database = client.db('onlineShop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');


        // get product Api
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            // console.log(req.query)
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if (page) {
                // console.log('hi there is page',page,size)
                products = await cursor.skip(page * size).limit(10).toArray();
            } else {
                products = await cursor.toArray();
            }

            res.send({ count, products });
        })
        // use POST to get data by keys
        app.post('/products/bykeys', async (req, res) => {

            const keys = req.body;
            const query = { key: { $in: keys } };
            const products = await productCollection.find(query).toArray();

            res.json(products)
        })
        // Add orders API
        app.post('/orders', async (req, res) => {
            const order=req.body;
                // console.log('order',order)
         const result =await orderCollection.insertOne(order);
                res.json(result)
        })

    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ema jon server is running')
})

app.listen(port, () => {
    console.log('server running at port ', port)
})