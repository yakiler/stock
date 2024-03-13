import fs from 'fs';
import csv from 'csv-parser';

const filename = './values.csv'; // The input file name

const isValidDate = date => !isNaN(+ new Date(date))

// Date comparison size can be done using a minus sign using js implicit conversion
const dateCompare = (a, b) => isValidDate(new Date(a)) && isValidDate(new Date(b)) && (new Date(a) > new Date(b)) || false

/**
 * Calc the stock of largest absolute increase
 * @param {array} input Some stock list, like this `[{name: 'ABC', Date: '2015-1-1', notes: '', Value: '23.23', Change: 'INCREASED'}]` or `DLV,2015-8-18,notes,233.43,INCREASED`
 * @returns The biggest absolute gainer of any stock
 */
var calcStockLargestAbsoluteIncrease = (input = []) => {
    const columns = typeof input[0] === 'string' ? input[0].split(',') : Object.keys(input[1]);
    const res = [
        // one stock 
        // [  
            // first line: Purchase price
            // last line: Closing price
        // ]
    ];
    const nameToMapIndex = {
        // stock name     map to      the index from res
    };
    let i = 1;
    while(i < input.length) {
        const item = typeof input[i] === 'string' ? input[i].split(',') : Object.values(input[i]);
        if (!isValidDate(item[1]) || !['DECREASED', 'INCREASED'].includes(item?.[4])) {
            i++;
            continue
        }
        if (isNaN(nameToMapIndex[item[0]])) {
            if (!isNaN(item[3])) {
                res.push([{name: item[0], date: item[1], value: item[3], Change: item[4] === 'INCREASED' ? 1 : -1}]);
                nameToMapIndex[item[0]] = res.length - 1;
            }
        } else {
            const stock = res[nameToMapIndex[item[0]]];
            const currentStock = {name: item[0], date: item[1], value: item[3], Change: item[4] === 'INCREASED' ? 1 : -1}
            if (stock.length < 2) {
                if (dateCompare(item[1], stock[0].date)) {
                    stock.push(currentStock);
                } else {
                    stock.unshift(currentStock);
                }
            } else {
                if (dateCompare(item[1], stock[1].date)) {
                    stock[1] = currentStock;
                } else if (dateCompare(stock[0].date, item[1])) {
                    stock[0] = currentStock;
                }
            }
        }
        i++;
    }
    
    const result = res.reduce((acc, curr) => {
        const current = curr.reduce((subAcc, subCurr) => {
            // For floating point precision processing, it can be done using libraries such as ‘Math.js’
            return { value: subCurr.value - subAcc.value, name: subCurr.name }
        }, {value: 0});
        
        const currentValue = current.value;
        if (currentValue > acc.value) {
            return current;
        }
        return acc;
    }, {value: -Number.MAX_VALUE});
    if (!isNaN(result.value) && result.value !== -Number.MAX_VALUE) {
        return console.log(`${columns[0]}: ${result.name}, Stock increase: ${result.value}`)
    }
    return console.log('nil')
}

// var caseOne =  `Name,Date,notes,Value,Change
// IQZ,2015-7-8,notes,656.36,INCREASED
// DLV,2015-8-8,notes,173.35,INCREASED
// DLV,2015-10-4,notes,231.67,INCREASED
// DLV,2015-9-7,notes,209.57,DECREASED
// IQZ,2015-9-7,notes,641.23,DECREASED
// IQZ,2015-10-4,notes,657.32,INCREASED
// DLV,2015-8-18,notes,233.43,INCREASED
// DLV,2015-9-15,notes,158.73,DECREASED
// IQZ,2015-10-8,notes,537.53,DECREASED
// IQZ,2015-10-6,notes,Invalid,UNKNOWN`.split(`\n`);

// calcStockLargestAbsoluteIncrease(caseOne)

// var caseTwo = `Name,Date,notes,Value,Change
// IQZ,2015-7-8,notes,656.36,DECREASED
// DLV,2015-8-8,notes,773.35,DECREASED
// DLV,2015-10-4,notes,231.67,DECREASED
// DLV,2015-9-7,notes,299.57,DECREASED`

// calcStockLargestAbsoluteIncrease(caseTwo)


const readFileContent = async () => {
    const readStream = fs.createReadStream(filename);
    const array = [];
    return new Promise((resolve, reject) => {
        readStream.pipe(csv())
        .on('data', (row) => {
            // If the file contains too much content, it can be read in segments and the segmented results obtained.
            array.push(row);
        })
        .on('end', () => {
            console.log('Read complated');
            resolve(array);
        })
        .on('error', (err) => {
            console.error('Error: ', err);
            reject(error);
        });
    });
}

const start = async() => {
    const csvContentArray = await readFileContent();
    console.time('time')
    calcStockLargestAbsoluteIncrease(csvContentArray);
    console.timeEnd('time');
}

start();
