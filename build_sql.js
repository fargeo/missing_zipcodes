const fs = require('fs')
const parse = require('csv-parse')
const _ = require('underscore')
const mus = require('mustache')
let zipcodes = []
let areas = {}

fs.createReadStream('./assignments.csv')
	.pipe(parse({
		delimiter: ','
	}))
	.on('data', (csvrow) => {
		if (csvrow[0] === '' || csvrow[0] === 'Area') {
			return
		}
		if (!areas.hasOwnProperty(csvrow[0])) {
			areas[csvrow[0]] = {
				type: csvrow[5],
				inspectors: [{
					name: csvrow[3],
					email: csvrow[4],
					type: 'Primary',
					areaName: csvrow[0]
				}],
				zipcodes: []
			}
		}
		areas[csvrow[0]].zipcodes.push(csvrow[2])
	})
	.on('end', () => {
		fs.createReadStream('./backup_assignments.csv')
			.pipe(parse({
				delimiter: ','
			}))
			.on('data', (csvrow) => {
				if (csvrow[0] === '' || csvrow[0] === 'Supervisor' || !areas[csvrow[1]]) {
					return
				}
				if (csvrow[2] != '' && areas[csvrow[1]].inspectors.length > 0) {
					areas[csvrow[1]].inspectors[0].num = csvrow[2]
				}
				if (csvrow[4]) {
					areas[csvrow[1]].inspectors.push({
						name: csvrow[5],
						num: csvrow[4],
						email: csvrow[6],
						type: 'First Alternate',
						areaName: csvrow[1]
					})
				}
				if (csvrow[6]) {
					areas[csvrow[1]].inspectors.push({
						name: csvrow[8],
						num: csvrow[7],
						email: csvrow[9],
						type: 'Second Alternate',
						areaName: csvrow[1]
					})
				}
			})
			.on('end', () => {
				fs.createReadStream('./missing_zipcodes.csv')
					.pipe(parse({
						delimiter: ','
					}))
					.on('data', (csvrow) => {
						if (csvrow[0] === 'ZipCode' || csvrow[1] === '') {
							return
						}
						zipcodes.push({
							ZipCode: csvrow[0],
							WKT: csvrow[1]
						})
					})
					.on('end', () => {
						fs.readFile('./template.sql', (err, tpl) => {
							if (err) throw err
							areas = _.map(areas, (v, k) => {
								v.zipcodes = _.map(_.unique(v.zipcodes), (val) => {
									return {
										areaName: k,
										zip: val
									}
								})
								v.areaName = k
								return v
							})
							let content = mus.render(tpl.toString('utf8'), {
								zipcodes: zipcodes,
								areas: areas
							})

							fs.writeFile("./output.sql", content, (err) => {
								if (err) throw err
							})
						})
					})
			})
	})
