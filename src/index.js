const core = require('@actions/core');
const downloadData = require('./downloadData.js');

downloadData((twoWeeksData, downloadError) => {
  if (downloadError) {
    core.setFailed(downloadError.message);
  }
});
