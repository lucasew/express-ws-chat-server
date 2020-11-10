# WS-channel

A simple server that implements websocket raw data channels

Think like a IRC room but for web devices

Yeah, there are things like [NATS](https://nats.io/) and [MQTT](https://mqtt.org/) but they doesn't integrates using routes with express and are more complex.

You can playground it opening the / endpoint when running this, the playground is a simple chat app that supports reconnection. Also there are a demo instance [here](https://ws-channel.herokuapp.com/)

All the network transportation happens using WebSocket or HTTP in some tool routes.

## How to use it

- Deploy
  - Heroku: Just set it up pointing this repository or a fork of it. This application is stateless about the messages so no database is required.
  - Local: `yarn dev` or `yarn start`. The difference is that `yarn dev` have hot reload on file changes.
- Routes
  - `/`: Web interface/playground
    - No parameters
  - `/emit/:topic`: Send a message to a topic using a http request.
    - **NOTE**: Maximum size of payload is 100kb. 
    - It doesn't care about the mime type.
  -  `/wait-next/:topic`: HTTP endpoint that hangs until the next message in a topic or timeout :man_shrugging:.
    - Always returns `application/octet-stream`
  - `/listen/:topic`: Websocket endpoint that connects to a topic and is able to also send messages to it.
    - It receives the messages it sents
- **GENERAL NOTE**: There is nothing about authentication or identity implemented. The only criptography is the TLS given by the host. Your data will be processed the way you sent as NodeJS buffers and the only thing that it provides to privatize your data stream is the secrecy of the channel name.  
- That's it. The demo have a practical example to how to use the `/listen/:topic` using the good old JQuery.
- Have fun :balloon: