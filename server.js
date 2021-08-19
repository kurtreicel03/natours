/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB CONNCTION SUCCESSFUL!');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

process.on('unhandledRejection', err => {
  server.close(() => {
    console.log(err.message);
    process.exit(1);
  });
});
