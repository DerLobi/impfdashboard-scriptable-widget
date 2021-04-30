const downloadData = require('./downloadData.js')
const createChart = require('./createChart.js')
const core = require('@actions/core');

downloadData(function(weeklyData, error) {

    if(error) {        
        core.setFailed(error.message);
        return
    }

    createChart(weeklyData, function(error) {
        if(error) {
            core.setFailed(error.message);
            return
        }
        console.log("done")
    })
})
