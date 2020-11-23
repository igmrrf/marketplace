require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require('path');
const cors = require("cors");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");

const { PORT } = require("./src/config/");
const dbConnect = require("./src/config/db");
const upload = require("./src/helpers/multer");
const globalErrHandler = require("./src/helpers/responses/errorHandler");
const CustomError = require("./src/helpers/responses/customError");
const swaggerDocument = YAML.load("./src/docs/swagger.yaml");

//routes
const adminRoute = require('./src/routes/admin');
const userRoute = require('./src/routes/user');
const orgRoute = require('./src/routes/organisation');
const driverRoute = require('./src/routes/driver');


dbConnect();

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(upload.single('image'));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "welcome to upbase foods",
  });
});

app.use(
  ["/docs", "/api/v1/docs"],
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);


app.use('/api/v1/admin', adminRoute);
app.use('/api/v1', userRoute);
app.use('/api/v1/driver', driverRoute);
app.use('/api/v1/company', orgRoute);


//handle Undefined routes
app.use("*", (req, res, next) => {
  const error = new CustomError(
    404,
    `Oops. The route ${req.method} ${req.originalUrl} is not recognised`
  );
  next(error);
});

app.use((err, req, res, next) => {
  globalErrHandler(err, req, res, next);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🔥`);
});

module.exports = app;
