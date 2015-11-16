/**
 * Created by jakobgaardandersen on 14/11/2015.
 */
var program = require('commander');
var downloader = require('./downloader');

program
    .version('0.0.1')
    .option('-c --comic <id>', 'Download comic stripe')
    .option('-d --directory <path>', 'Path to where the stripe should be downloaded', __dirname + '/tmp')
    .option('-r --random', 'Download a random comic stripe')
    .option('-l --latest', 'Download the latest XKCD')
    .parse(process.argv);

downloader.downloadComic({comic: program.comic, dir: program.directory, random: program.random})
    .then(function () {
    }, function (reason) {
        console.error(reason);
    });


// TODO implement --random
// TODO implement get latest
// TODO implement get all
// TODO implement simple json db