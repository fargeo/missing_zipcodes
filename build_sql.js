"use strict"
const fs = require('fs')
const parse = require('csv').parse
const _ = require('underscore')
const mus = require('mustache')

let zipcodes = []
let areas = {}
let content = ''

const prepArea = (primaryAssignmentRow) => {
	if (primaryAssignmentRow[0] === '' || primaryAssignmentRow[0] === 'Area') {
		return
	}
	if (!areas.hasOwnProperty(primaryAssignmentRow[0])) {
		areas[primaryAssignmentRow[0]] = {
			type: primaryAssignmentRow[5],
			inspectors: [{
				name: primaryAssignmentRow[3],
				email: primaryAssignmentRow[4],
				type: 'Primary',
				areaName: primaryAssignmentRow[0]
			}],
			zipcodes: []
		}
	}
	areas[primaryAssignmentRow[0]].zipcodes.push(primaryAssignmentRow[2])
}

const getBackupAssignments = () => {
	fs.createReadStream('./backup_assignments.csv')
		.pipe(parse({
			delimiter: ','
		}))
		.on('data', processBackupInspectorData)
		.on('end', getZipCodeData)
}

const processBackupInspectorData = (backupInspectorData) => {
	if (backupInspectorData[0] === '' ||
		backupInspectorData[0] === 'Supervisor' ||
		!areas[backupInspectorData[1]]) {
		return
	}
	if (backupInspectorData[2] != '' &&
		areas[backupInspectorData[1]].inspectors.length > 0) {
		areas[backupInspectorData[1]].inspectors[0].num = backupInspectorData[2]
	}
    addBackupInspectorData(backupInspectorData, 4, 'First Alternate')
    addBackupInspectorData(backupInspectorData, 7, 'Second Alternate')
}

const addBackupInspectorData = (backupInspectorData, startIndex, type) => {
    if (backupInspectorData[startIndex]) {
        areas[backupInspectorData[1]].inspectors.push({
            name: backupInspectorData[startIndex+1],
            num: backupInspectorData[startIndex],
            email: backupInspectorData[startIndex+2],
            type: type,
            areaName: backupInspectorData[1]
        })
    }
}

const getZipCodeData = () => {
    fs.createReadStream('./missing_zipcodes.csv')
        .pipe(parse({
            delimiter: ','
        }))
        .on('data', prepZipCode)
        .on('end', writeSQLFile)
}

const prepZipCode = (zipCodeRow) => {
    if (zipCodeRow[0] === 'ZipCode' || zipCodeRow[1] === '') {
        return
    }
    zipcodes.push({
        ZipCode: zipCodeRow[0],
        WKT: zipCodeRow[1]
    })
}

const writeSQLFile = () => {
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
        content = mus.render(tpl.toString('utf8'), {
            zipcodes: zipcodes,
            areas: areas
        })

        fs.writeFile("./output.sql", content, (err) => {
            if (err) throw err
        })
    })
}

fs.createReadStream('./assignments.csv')
	.pipe(parse({
		delimiter: ','
	}))
	.on('data', prepArea)
	.on('end', getBackupAssignments)
