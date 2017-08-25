var fs = require('fs'); 
var parse = require('csv-parse');
var _ = require('underscore');
var mus = require('mustache')
var zipcodes = [];

fs.createReadStream('./new_zipcodes.csv')
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
        if (csvrow[0] === 'ZipCode') {
            return;
        }
        zipcodes.push({
            ZipCode: csvrow[0],
            WKT: csvrow[1]
        })
    })
    .on('end',function() {
        fs.readFile('./template.sql', (err, tpl) => {
            if (err) throw err

            var content = mus.render(tpl.toString('utf8'), {
                zipcodes: zipcodes
            });
            
            fs.writeFile("./output.sql", content, function(err) {
                if(err) throw err
            }); 
        })
    });
    