let downloadData = require('./downloadData.js')
let createChart = require('./createChart.js')

downloadData(function(weeklyData) {
    createChart(weeklyData, function() {
        console.log("done")
    })
})
