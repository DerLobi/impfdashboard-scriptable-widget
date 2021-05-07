const vega = require('vega');
const sharp = require('sharp');
const chartSpec = require('./chart.json');

function weekdayFromDate(dateString, sizeCategory) {
  const options = sizeCategory === 'large' ? { weekday: 'short', day: 'numeric', month: 'numeric' } : { weekday: 'short' };

  const weekday = new Date(dateString)
    .toLocaleString('de-DE', options);
  return weekday;
}

const sizes = {
  small: {
    width: 400,
    height: 80,
  },
  medium: {
    width: 400,
    height: 200,
  },
  large: {
    width: 800,
    height: 400,
  },
};

module.exports = function createChart(dailyData, sizeCategory, filePath, completion) {
  chartSpec.data[0].values = dailyData.map((record) => ({
    weekDay: weekdayFromDate(record.date, sizeCategory),
    numberOfDoses: record.dosen_differenz_zum_vortag,
  }));

  const size = sizes[sizeCategory];
  chartSpec.width = size.width;
  chartSpec.height = size.height;

  const view = new vega.View(vega.parse(chartSpec))
    .renderer('none')
    .initialize();

  view.toSVG().then(async (svg) => {
    await sharp(Buffer.from(svg))
      .toFormat('png')
      .toFile(filePath);
    completion();
  })
    .catch((err) => {
      completion(err);
    });
};
