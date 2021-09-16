const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {places,descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{

    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true


})

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
     
     console.log("Database connected");
})



const sample = (array) => array[Math.floor(Math.random() * array.length)];


const seedDB = async()=>{
     await Campground.deleteMany({}) 
     for(let i = 0; i < 200 ; i++)
    {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random()*20) +10;
        const campground = new Campground({
            author:'61321bdd899c400cf40a71ea',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image:'https://source.unsplash.com/collection/483251',
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod,tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
            price,
            geometry:
            {
                
                type:'Point'
                ,
                coordinates : [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                    ]
            },
            images: 
            [
            {
    
      
      url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      filename: 'YelpCamp/aqaj9m3qcr8h4qkobc3i'
    },
    {
    url: 'https://res.cloudinary.com/dpq0goe2g/image/upload/v1631111334/YelpCamp/aqaj9m3qcr8h4qkobc3i.jpg',
      filename: 'YelpCamp/aqaj9m3qcr8h4qkobc3i'
    }]})

     await campground.save();
    }


}

seedDB().then(()=>{

    mongoose.connection.close()

})

