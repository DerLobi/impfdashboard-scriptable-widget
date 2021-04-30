const https = require("https");
const fs = require("fs");
const parse = require("csv-parse");

module.exports = function (completion) {
  const output = [];
  // Create the parser
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
    delimiter: "\t",
  });

  // Use the readable stream api
  parser.on("readable", function () {
    let record;
    while ((record = parser.read())) {
      output.push({
        date: record.date,
        dosen_kumulativ: parseFloat(record.dosen_kumulativ),
        impf_quote_erst: parseFloat(record.impf_quote_erst),
        impf_quote_voll: parseFloat(record.impf_quote_voll),
        dosen_differenz_zum_vortag: parseFloat(
          record.dosen_differenz_zum_vortag
        ),
      });
    }
  });
  // Catch any error
  parser.on("error", function (err) {
    console.error(err.message);
  });

  parser.on("end", function () {
    const lastWeek = output.slice(output.length - 7, output.length);
    // console.log(lastWeek)
    try {
      fs.writeFileSync("./data/data.json", JSON.stringify(lastWeek));
      completion(lastWeek);
    } catch (err) {
      console.error(err);
    }
  });

  const request = https.get(
    "https://impfdashboard.de/static/data/germany_vaccinations_timeseries_v2.tsv",
    function (response) {
      response.pipe(parser);
    }
  );
};
