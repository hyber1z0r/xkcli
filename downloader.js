/**
 * Created by jakobgaardandersen on 14/11/2015.
 */
var request = require('request');
var Q = require('q');
var fs = require('fs');

/**
 * @param {string || integer} id for the
 * */
function getImageURL(id) {
    var deferred = Q.defer();

    console.log('Fetching...');
    request('http://xkcd.com/' + id + '/info.0.json', function (error, response, body) {
        if (error) {
            deferred.reject(new Error('Error in fetching from the internet. Check your connection and try again.'));
        } else {
            try {
                var comic = JSON.parse(body);
                deferred.resolve(comic.img);
            } catch (e) {
                deferred.reject(new Error('Error in parsing JSON, so ID must be wrong. Bitch.'));
            }
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

    var writeStream = fs.createWriteStream(path + '/' + id + '.png');

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

function downloadComic(args) {
    if (!args.random) {
        return getImageURL(args.comic)
            .then(function (url) {
                return downloadImage(url, args.dir, args.comic);
            });
    } else {
        throw new Error('Not impl');
    }

}

module.exports.downloadComic = downloadComic;