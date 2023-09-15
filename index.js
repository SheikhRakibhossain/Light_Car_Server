const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000 ;
const cors = require('cors');

//middle ware
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{

    res.send('Light Car Server is running on there or here..!')
})

app.listen(port,(req, res)=>{
    console.log(`server is running on ${port}`)
})