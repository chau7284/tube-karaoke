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

module.exports = router;