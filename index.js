
    require('dotenv').config();


const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const campgroundsRoutes = require('./routes/campground')
const reviewsRoutes = require('./routes/reviews')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const userRoutes = require('./routes/users')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoDBStore = require("connect-mongodb-session")(session);


mongoose.connect(dbUrl,{

    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false


})

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
     
     console.log("Database connected");
})


var app = express();



app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,"views"))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize())

const secret = process.env.SECRET || "thishshouldbeabettersecret"


const store = new MongoDBStore({

   url:dbUrl,
   collection:"session",
   databaseName:"myFirstDatabase"

})

store.on("error",function(e){

    console.log("Session store error",e)
})


const sessionConfig = {

    store:store,
    name:'session',
    secret:secret,
    resave:false,
    saveUninitialized:true,
    cookie:
    {
        httpOnly:true,
        //secure:true,
        expries: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7
    }

}

app.use(session(sessionConfig))
app.use(flash());





app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))


passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())




app.use((req,res,next)=>{

    console.log(req.session)

    res.locals.currentUser = req.user; 
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();

})

app.use('/campgrounds/:id/reviews',reviewsRoutes)
app.use('/campgrounds',campgroundsRoutes)
app.use('/',userRoutes)

app.get('/',(req,res)=>{

  res.render('home')


})



app.all('*',(req,res,next)=>{

    next(new ExpressError('Page not found',404))

})


app.use((err,req,res,next)=>{

    const {statusCode = 500,message = "Something went wrong"} = err;
    if(!err.message) err.message = "Oh no, Something went wrong."
    res.status(statusCode).render("error",{err})


})

app.listen(3000,()=>{

console.log("serving on port3000")
})



app.use(helmet());

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self '", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dpq0goe2g/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



