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
    .parse(process.argv);

downloader.downloadComic(program.comic, program.directory)
    .then(function () {
    }, function (reason) {
        console.log(reason);
    });