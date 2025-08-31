var express = require('express');
require("dotenv").config();
require("./middleware/database").connect();
 
const bodyParser = require('body-parser');
var app = module.exports = express();
const path = require('path');
const cors = require("cors");
app.use(cors());
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
 
const mainApi = require('./router/mainApi')

const { API_PORT } = process.env;
const port = API_PORT;

var router = express.Router();
router.use(bodyParser.json())

// Let's make our express `Router` first.
var router = express.Router();
router.use(bodyParser.urlencoded({
  extended: true
}))
router.use(bodyParser.json())
router.get('/error', function(req, res, next) {
  // here we cause an error in the pipeline so we see express-winston in action.
  return next(new Error("This is an error and it should be logged to the console"));
});

router.use('/api', mainApi)

router.use(cors());
// express-winston logger makes sense BEFORE the router

// Now we can tell the app to use our routing code:
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}))
app.use('/upload', express.static('upload'));

global.publicDir = __dirname + "/payment/";
app.use(express.static(path.join(__dirname, 'publicPay')));
app.set('views', path.join(__dirname, 'publicPay'));
app.set('view engine', 'ejs'); 

app.use(router)
app.use('/uploads', express.static('uploads'));
// Optionally you can include your custom error handler after the logging.
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Gold endpoints',
    },
    servers: [
      {
        url: 'http://localhost:6060/api/panel/faktor'
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',       // Define the type of security scheme
          in: 'header',         // Specify that the API key is in the header
          name: 'x-access-token', // Name of the header to be used
          description: 'Enter your API key here',
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [], // Apply the security scheme globally
      },
    ],
  },
  apis: ['./document/*Doc.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.listen(port, function(){
  console.log("logger listening on port %d in %s mode", this.address().port, app.settings.env);
});