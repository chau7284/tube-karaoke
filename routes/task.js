const settings = require('../settings');
const dbSong = require('../dbSong');

/**
*  
* REFERENT LINK 
* 
*/

exports.current = function (res) {
    res.send(SONGS.length + "/" + PAGE);
    res.end();
}

exports.find = function (res) {
    find_song(res);
}

exports.clear = function (res) {
    SONGS = [];
    page = 0;
    res.json(settings.SUCCESS);
    res.end();
}


let SONGS = [];
const LIMIT = 100;
let PAGE = 0;

async function find_song(res){
    try{

        if (SONGS.length <= 0) {
            await dbSong.find()
                //.select('_id')
                .limit(LIMIT)
                .skip(LIMIT * PAGE)
                .exec((error, songs) => {
                    if (!error) {
                        console.log('<<<<<- FIND-TASK Page: >>>>> ' + PAGE);
                        if (songs.length < LIMIT) PAGE = 0;
                        else PAGE++;
                        SONGS = songs;
                        resp(res);
                    }
                });
        } else {
            resp(res);
        }

    }catch(err){
        res.json(settings.ERROR);
        res.end();
    }
}

function resp(res) {
    var tmp = [];
    tmp.push(SONGS[0]);
    SONGS.shift();
    if (tmp[0] != null)
        console.log('<<<<<- FIND-TASK ->>>>> :' + tmp[0]._id + " - index: " + SONGS.length + "/" + PAGE);
    res.json(tmp);
    res.end();
}
