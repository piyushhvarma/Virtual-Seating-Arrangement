const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('SeatingPlan-AIM3201-DeepLearning.pdf');

pdf(dataBuffer).then(function(data) {
    console.log("NUM PAGES", data.numpages);
    console.log("INFO", data.info);
    console.log("TEXT SAMPLE");
    console.log(data.text.substring(0, 2000));
}).catch(err => console.error(err));
