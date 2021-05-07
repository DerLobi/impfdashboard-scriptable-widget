const core = require('@actions/core');
const downloadData = require('./downloadData.js');
const createChart = require('./createChart.js');

downloadData((twoWeeksData, downloadError) => {
  const weeklyData = twoWeeksData.slice(twoWeeksData.length - 7, twoWeeksData.length);
  if (downloadError) {
    core.setFailed(downloadError.message);
    return;
  }

  createChart(weeklyData, 'small', './data/barChart.png', (error) => {
    if (error) {
      core.setFailed(error.message);
    }
  });

  createChart(weeklyData, 'medium', './data/barChart-medium.png', (error) => {
    if (error) {
      core.setFailed(error.message);
    }
  });

  createChart(twoWeeksData, 'large', './data/barChart-large.png', (error) => {
    if (error) {
      core.setFailed(error.message);
    }
  });
});
