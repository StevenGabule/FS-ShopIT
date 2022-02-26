const dotenv = require('dotenv');
dotenv.config({path: 'backend/config/config.env'});

// connect database
const connectDatabase = require('./config/database');


const app = require('./app');

// const server =
app.listen(process.env.PORT, () => {
  console.log(
    `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
  connectDatabase();
});

// handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.log(`ERROR: ${err.stack}`);
//   console.log(`Shutting down the server due to unhandled exception`);
//   process.exit(1);
// });


// // handle unhandled promise rejection
// process.on('unhandledRejection', (err) => {
//   console.log(`ERROR: ${err.message}`);
//   console.log(`Shutting down the server due to unhandled Promise rejection`);
//   server.close(() => {
//     process.exit(1);
//   });
// });
