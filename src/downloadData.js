const https = require('https');
const fs = require('fs');
const parse = require('csv-parse');

module.exports = function downloadData(completion) {
  const output = [];

  const parser = parse({
    columns: true,
    skip_empty_lines: true,
    delimiter: '\t',
  });

  parser.on('readable', () => {
    let record;
    while ((record = parser.read())) {
      output.push({
        date: record.date,
        dosen_kumulativ: parseFloat(record.dosen_kumulativ),
        impf_quote_erst: parseFloat(record.impf_quote_erst),
        impf_quote_voll: parseFloat(record.impf_quote_voll),
        dosen_differenz_zum_vortag: parseFloat(
          record.dosen_differenz_zum_vortag,
        ),
      });
    }
  });

  parser.on('error', (err) => {
    completion(null, err);
  });

  parser.on('end', () => {
    const lastTwoWeeks = output.slice(output.length - 14, output.length);
    try {
      fs.writeFileSync('./data/data.json', JSON.stringify(lastTwoWeeks));
      completion(lastTwoWeeks, null);
    } catch (err) {
      completion(null, err);
    }
  });

  https.get(
    'https://impfdashboard.de/static/data/germany_vaccinations_timeseries_v2.tsv',
    (response) => {
      response.pipe(parser);
    },
  );
};
