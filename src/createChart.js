const vega = require('vega');
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
    // .renderer("none")
    .renderer('canvas')
    .initialize();

  view
    .toCanvas()
    .then(function (canvas) {
      console.log("Writing PNG to file...");
      fs.writeFileSync("./data/barChart.png", canvas.toBuffer());
    })
    .catch(function (err) {
      console.log("Error writing PNG to file:");
      console.error(err);
    });
};

function weekdayFromDate(dateString) {
  const weekday = new Date(dateString)
    .toLocaleString("de-DE", { weekday: "short" })
    .toUpperCase();
  return weekday;
}
