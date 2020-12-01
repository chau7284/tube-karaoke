const express = require('express');
const router = express.Router();



function worker() {
  return new Promise((resolve) => {
    setTimeout(function() {
        resolve( "ok");
    }, 20000);
  });
} 

router.get('/extract', async (req, res) => {
    // if (req.headers['secret'] !== settings.SECRET) {
    //     res.json(settings.UN_AUTH);
    //     res.end();
    //     return;
    // }


    var videoId = req.query.videoId;
    console.log("va0");
    await worker().then(o =>{
        res.send(o);
    });


});


router.get('/extract1', async (req, res) => {
    // if (req.headers['secret'] !== settings.SECRET) {
    //     res.json(settings.UN_AUTH);
    //     res.end();
    //     return;
    // }
    var videoId = req.query.videoId;

    res.send("Done");

});


function findExtractWorker(videoId) {
  console.log("<<<<<- SOCKET-EXTRACT: >>>>> " + videoId);
  return new Promise((resolve) => {
      if (connections.length > 0) {
          var socket = connections[0];
          socket.emit("EXTRACT", videoId);
          socket.on(videoId, streamData => {
              resolve(streamData);
          });
      } else {
          resolve(null);
      }
  })
}

app.get('/extract', async (req, res) => {
  // if (req.headers['secret'] !== settings.SECRET) {
  //     res.json(settings.UN_AUTH);
  //     res.end();
  //     return;
  // }
  var videoId = req.query.videoId;
  await findExtractWorker(videoId).then(streamData => {
      res.json(streamData);
      res.end();
  })
});

app.get('/info', async (req, res) => {
  // if (req.headers['secret'] !== settings.SECRET) {
  //     res.json(settings.UN_AUTH);
  //     res.end();
  //     return;
  // }
  var videoId = req.query.videoId;
  await findExtractWorker(videoId).then(streamData => {
      res.json(streamData);
      res.end();
  })
});

app.get('/search', async (req, res) => {
  // if (req.headers['secret'] !== settings.SECRET) {
  //     res.json(settings.UN_AUTH);
  //     res.end();
  //     return;
  // }
  var keyword = req.query.keyword;
  var deviceId = req.query.deviceId; //Split 11 charactor
  await findSearchWorker(deviceId, keyword).then(songs => {
      res.json(songs);
      res.end();
  })
});

function findSearchWorker(deviceId, keyword) {
  return new Promise((resolve) => {
      if (connections.length > 0) {
          var socket = connections[0];
          socket.emit("SEARCH", keyword, deviceId);
          socket.on(deviceId, songs => {
              resolve(songs);
          });
      } else {
          resolve(null);
      }
  })
}

module.exports = router;