const settings = require('./settings');
const utils = require('./utils.js');
const dbSong = require('./dbSong');
const dbVideo = require('./dbVideo');

exports.select_token = function (id, tk, callback) {
    dbSong.findOne(
        { _id: id, token: tk }
    ).exec((error, user) => {
        if (!error) {
            callback(user);
        } else {
            callback(null);
        }
    });
}

//OK
exports.check_exist = function (params, res) {
    dbSong.findOne(
        {
            _id: params._id
        }
    ).exec((err, result) => {
        if (result) {
            //Exist
            console.log("<<<<<- ADD-EXIST ->>>>> " + params._id);
            update(params, res);
        } else {
            //Not Exist
            console.log("*** ADD-NEW *** " + params._id);
            insert(params, res);
        }
    });
}

function insert(params, res) {
    try {
        dbSong.create(
            params
            ,
            (err, song) => {
                if (!err) {
                    res.json(song);
                    res.end();
                } else {
                    res.json(settings.ERROR);
                    res.end();
                }
            }
        );
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
}

function update(params, res) {
    res.json(null);
    res.end();
}

//OK
exports.delete = function (videoId, res) {
    dbSong.deleteOne(
        {
            _id: videoId
        }
    ).exec((err, result) => {
        if (!err) {
            res.json(result);
            res.end();
        } else {
            res.json(settings.ERROR);
            res.end();
        }
    });
}

//OK
exports.delete_all_type1 = function (res) {
    dbSong.deleteMany(
        {
            type: 1
        }
    ).exec((err, result) => {
        if (!err) {
            res.json(result);
            res.end();
        } else {
            res.json(settings.ERROR);
            res.end();
        }
    });
}

//OK
exports.update = function (params, res) {
    try{
        
        dbSong.updateOne(
            {
                _id: params._id
            },
            {
                $set: { 
                    video: params.video,
                    audio: params.audio
                }
            },
        )
            .exec((err, result) => {
                if (!err) {
                    console.log("<<<<<- UPDATE-LINK: >>>>> " + params._id);
                    res.send(settings.SUCCESSFUL);
                    res.end();
                } else {
                    res.json(settings.ERROR);
                    res.end();
                }
            });

    }catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
}

//OK
exports.check_exist_link = function (params, res) {
    dbSong.findOne(
        {
            _id: params._id
        }
    ).exec((err, song) => {
        if (song) {
            //Exist
            console.log("<<<<<- UPDATE-LINK-EXIST ->>>>> " + params._id);
            update_link(song, params, res);
        } else {
            //Not Exist
            console.log("*** UPDATE-LINK-NEW *** " + params._id);
            insert_link(params, res);
        }
    });
}

function insert_link(params, res) {
    try {
        params.type = 1;
        dbSong.create(
            params
            ,
            (err, song) => {
                if (!err) {
                    res.json(settings.SUCCESS);
                    res.end();
                } else {
                    res.json(settings.ERROR);
                    res.end();
                }
            }
        );
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
}

function update_link(song, params, res) {
    if(song.type === undefined || song.type===0){
        params.type = 0;
    }else{
        params.type= 1;
    }
    try {
        dbSong.updateOne(
            {
                _id: params._id
            },
            params,
            (err, l) => {
                if (!err) {
                    res.json(l);
                    res.end();
                } else {
                    res.json(settings.ERROR);
                    res.end();
                }
            }
        );
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
}

//Get Info Song
exports.get_song_by_id = function (videoId, res) {
    dbSong.findOne(
        { _id: videoId }
    ).exec((err, song) => {
        if (!err) {
            res.json(song);
            res.end();
        } else {
            res.json(settings.ERROR);
            res.end();
        }
    });
}

//OK
exports.find_song_by_id = function (videoId, callback) {
    dbSong.findOne(
        { _id: videoId }
    ).exec((err, song) => {
        if (!err) {
            //Counter
            if (song != null) {
                song.counter++;
                song.save();
            }
            callback(song);
        } else {
            callback(null);
        }
    });
}

//Dropbox
exports.find_video_by_id = function (videoId, callback) {
    dbVideo.findOne(
        { _id: videoId }
    ).exec((err, song) => {
        if (!err) {
            //find random relate song
            var songs = [{
                "id": song._id,
                "name": "",
                "uploader":"",
                "thumb":"",
                "duration":""
            }];

            var songStream = {
                "id":song._id,
                "songs":songs,
                "video":song.url,
                "audio":""
            }
            callback(songStream);
        } else {
            callback(null);
        }
    });
}