const axios = require('axios');
const firestore = require('./firestore');


exports.getListVersion = async function() {
        try {
          const response = await axios.get('http://apk-box.lizks.com/NASOTA/nasversion.json');
          var res = response.data;
          if(res !== null){
            var arr = res.Youtube;
            if(arr !== null && arr.length > 0){
              var ver = arr[0].list;
              console.log(ver);

              firestore.getSChedule(ver).then(result =>{
                if(result){
                  firestore.setSchedule(ver);
                  downloadFile();
                }
              });
            }
          }
        } catch (error) {
          console.error(error);
        }
}

async function downloadFile() {
  console.log("Download File");
    try {
      const response = await axios.get('http://apk-box.lizks.com/NASOTA/YTLIST/YT1000/ytlist.txt',{responseType: 'blob'});
      var arr = response.data.split('\r\n');
      console.log(arr[0]);
    } catch (error) {
      console.error(error);
    }
}