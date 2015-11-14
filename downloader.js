/**
 * Created by jakobgaardandersen on 14/11/2015.
 */
var request = require('request');
var cheerio = require('cheerio');
var Q = require('q');
var fs = require('fs');

/**
 * @param {string || integer} id for the
 * */
function getImageURL(id) {
    var deferred = Q.defer();

    console.log('Fetching...');
    request('http://xkcd.com/' + id, function (error, response, body) {
        if (error) {
            deferred.reject(new Error('Error in fetching from the internet. Check your connection and try again.'));
        } else {
            var $ = cheerio.load(body);
            var img = $('#comic').children('img');
            var imgURL = img.attr('src');
            imgURL = 'http:' + imgURL;
            deferred.resolve(imgURL);
        }
    });

    return deferred.promise;
}

function downloadImage(url, path, id) {
    var deferred = Q.defer();

    try {
        fs.statSync(path);
    } catch (err) {
        fs.mkdirSync(path);
    }

    var writeStream = fs.createWriteStream(path + '/' +  id + '.png');

    writeStream.on('error', function () {
        deferred.reject(new Error('Error in writing image to disk'));
    });

    writeStream.on('end', function () {
        deferred.resolve();
    });

    request
        .get(url)
        .on('error', function () {
            deferred.reject(new Error('Error in downloading image.'));
        })
        .pipe(writeStream);

    return deferred.promise;
}

function downloadComic(id, path) {
    return getImageURL(id)
        .then(function (url) {
            return downloadImage(url, path, id);
        });
}

module.exports.downloadComic = downloadComic;