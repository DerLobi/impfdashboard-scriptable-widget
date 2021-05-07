const downloadData = require('./downloadData.js')
const createChart = require('./createChart.js')
const core = require('@actions/core');

downloadData(function(twoWeeksData, error) {    
    const weeklyData = twoWeeksData.slice(twoWeeksData.length - 7, twoWeeksData.length);
    if(error) {        
        core.setFailed(error.message);
        return
    }

    createChart(weeklyData, "small", './data/barChart.png', function(error) {
        if(error) {
            core.setFailed(error.message);
            return
        }
    })

    createChart(weeklyData, "medium", "./data/barChart-medium.png", function(error) {
        if(error) {
            core.setFailed(error.message);
            return
        }        
    })

    createChart(twoWeeksData, "large", "./data/barChart-large.png", function(error) {
        if(error) {
            core.setFailed(error.message);
            return
        }        
    })
})
