import express from "express";
import cors from "cors";
import morgan from "morgan";
import expressws from "express-ws";
import EventLoop from "./eventloop";
import { promisify } from "util";

const evloop = new EventLoop<string, Buffer>((m) => {
  return Buffer.isBuffer(m);
});

const router = express()

router.use(
  express.raw({
    type: "*/*",
  })
);
router.use(morgan("tiny"));
router.use(cors());

const ewsInstance = expressws(router);

router.get("/", express.static(__dirname));

router.use("/emit/:topic", async (req, res) => {
  const topic = req.params.topic;
  console.log("express emit ", topic);
  console.log(req.body);
  if (await evloop.publish(topic, req.body)) {
    res.status(201).json({
      ok: true,
    });
  } else {
    throw {
      message: "channel not found",
      status: 404,
    };
  }
});

router.use("/wait-next/:topic", async (req, res) => {
  await evloop.subscribe_once(
    (b) => {
      res.send(b);
      return Promise.resolve();
    },
    [req.params.topic]
  );
});

const listenerRouter = express.Router();
ewsInstance.applyTo(listenerRouter);
listenerRouter.ws("/listen/:topic", async (ws, req) => {
  const { topic } = req.params;
  const sockID = await evloop.subscribe(
    async (msg) => {
      if (ws.readyState === 1) {
        await promisify(ws.send.bind(ws))(msg);
      } else {
        await evloop.removeConsumer(sockID);
      }
      return;
    },
    [topic]
  );
  ws.on("message", (data) => {
    console.log("received message ", data);
    evloop.publish(topic, Buffer.from(data)).catch(console.error);
  });
});

router.use(listenerRouter);

export default router