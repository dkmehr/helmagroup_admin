const { stringify } = require("csv-stringify");
var fs = require('fs');

const DataToCSV=async(data)=>{
    const random = Math.random()
    const writableStream = fs.createWriteStream("./upload/csv/result"+random.toString()+".csv")
    const columns = [
        "i",
        "x",
        "y",
        "z"
      ];
      const stringifier = stringify({ header: true, columns: columns });
      for (var i=0;i<data.length;i++){
        stringifier.write(data[i]);
      }
      stringifier.pipe(writableStream);

    return("https://admin.fahascrubs.com/upload/csv/result"+random.toString()+".csv")
}

module.exports =DataToCSV