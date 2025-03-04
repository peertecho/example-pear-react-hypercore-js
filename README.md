# Overview
- Example of Pear desktop app with Javascript + React + Hyperswarm
- Multiple app instances can run concurrently (same machine or different machines) 
to connect and send message to each other with Hyperswarm streams

# Getting started
## Prod mode
```shell
npm i
npm run build
npm start
```

## Dev mode
```shell
npm i
npm run dev
```

# Run
- Open two apps, e.g. run `npm run dev` in two terminals
- On the first app, 
  - click Create topic
  - wait for topic created with a topic key
- On the second app
  - copy the above topic key into the Join topic input box
  - click Join topic
  - wait for topic joined
- On any app, send a message in an app, the other app will receive it
