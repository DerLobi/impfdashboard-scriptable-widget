const vega = require('vega');
const sharp = require("sharp");
const fs = require("fs");

module.exports = function (dailyData, sizeCategory, filePath, completion) {
  let chartSpec = require("./chart.json");

  chartSpec.data[0].values = dailyData.map((record) => {
    return {      
      weekDay: weekdayFromDate(record.date, sizeCategory),
      numberOfDoses: record.dosen_differenz_zum_vortag,
    };
  });

  const size = sizes[sizeCategory]
  chartSpec.width = size.width
  chartSpec.height = size.height

  var view = new vega.View(vega.parse(chartSpec))
    .renderer("none")    
    .initialize();

    view.toSVG().then(async function (svg) {      
      await sharp(Buffer.from(svg))
          .toFormat('png')
          .toFile(filePath)
          completion()
    })
    .catch(function (err) {
      console.log("Error writing PNG to file:");
      console.error(err);
      completion(err)
    });
};

function weekdayFromDate(dateString, sizeCategory) {

  const options = sizeCategory == "large" ? { weekday: "short", day: 'numeric', month: 'numeric' } : { weekday: "short" }

  const weekday = new Date(dateString)
    .toLocaleString("de-DE", options)    
  return weekday;
}

const sizes = {
  "small": {
    width: 400,
    height: 80
  },
  "medium": {
    width: 400,
    height: 200
  },
  "large": {
    width: 800,
    height: 400
  }
}