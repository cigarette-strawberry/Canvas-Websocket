let redis = require('redis')
let WebSocket = require('ws')

let client = redis.createClient() // key value

let wss = new WebSocket.Server({ port: 3000 })
// 原生的 websocket 就两个常用的方法 on('message') send()
let clientsArr = []
wss.on('connection', function (ws) {
  clientsArr.push(ws)
  client.lRange('barrages', 0, -1, function (err, applies) {
    applies = applies.map((item) => JSON.parse(item))
    ws.send(
      JSON.stringify({
        type: 'INIT',
        data: applies,
      })
    )
  })
  ws.on('message', function (data) {
    // "{ value,time,color,speed }"
    client.rPush('barrages', data, redis.print)
    clientsArr.forEach((w) => {
      w.send(JSON.stringify({ type: 'ADD', data: JSON.parse(data) }))
    })
  })
  ws.on('close', function () {
    clientsArr = clientsArr.filter((client) => client != ws)
  })
})
