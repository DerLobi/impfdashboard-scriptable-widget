const vega = require('vega');
const sharp = require("sharp");
const fs = require("fs");

module.exports = function (weeklyData, completion) {
  let chartSpec = require("./chart.json");

  chartSpec.data[0].values = weeklyData.map((record) => {
    return {
      weekDay: weekdayFromDate(record.date),
      numberOfDoses: record.dosen_differenz_zum_vortag,
    };
  });

  var view = new vega.View(vega.parse(chartSpec))
    .renderer("none")
    // .renderer('canvas')
    .initialize();

    view.toSVG().then(async function (svg) {
      console.log("Writing PNG to file...");
      await sharp(Buffer.from(svg))
          .toFormat('png')
          .toFile('./data/barChart.png')
          completion()
    })
    .catch(function (err) {
      console.log("Error writing PNG to file:");
      console.error(err);
      completion(err)
    });
};

function weekdayFromDate(dateString) {
  const weekday = new Date(dateString)
    .toLocaleString("de-DE", { weekday: "short" })
    .toUpperCase();
  return weekday;
}
