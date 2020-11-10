import express from 'express';
import "express-async-errors";
import router from './index';
import getenv from 'getenv';

const app = router

app.use((req, res) => {
  throw {
    message: "route not found",
    status: 404,
  };
});

const errHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  let { status, message } = err;
  if (status === undefined) {
    status = 500;
  }
  res.json({
    error: {
      message,
      status,
    },
  });
};

app.use(errHandler);

const port = getenv.int("PORT", 3000)
app.listen(port, () => {
  console.log(`Listening @ port ${port}`)
});
