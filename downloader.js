/**
 * Created by jakobgaardandersen on 14/11/2015.
 */
var request = require('request');
var Q = require('q');
var fs = require('fs');
var XKCDBASE = 'http://xkcd.com/';
var XKCDSUF = 'info.0.json';

/**
 * @param {string} url for the xkcd you want to get the img url from
 * */
function getImageURL(url) {
    var deferred = Q.defer();

    request(url, function (error, response, body) {
        if (error) {
            deferred.reject(new Error('Error in fetching from the internet. Check your connection and try again.'));
        } else {
            try {
                var meta = JSON.parse(body);
                deferred.resolve(meta);
            } catch (e) {
                deferred.reject(new Error('Error in parsing JSON, so ID must be wrong. Bitch.'));
            }
        }
    });

    return deferred.promise;
}

/**
 * @param {string} meta is the xkcd that was downloaded from @function getImageURL
 * @param {string} path is the directory arg passed from the process args
 * */
function downloadImage(meta, path) {
    var deferred = Q.defer();

    try {
        fs.statSync(path);
    } catch (err) {
        fs.mkdirSync(path);
    }

    var writeStream = fs.createWriteStream(path + '/' + meta.num + '.png');

    writeStream.on('error', function () {
        deferred.reject(new Error('Error in writing image to disk'));
    });

    writeStream.on('end', function () {
        deferred.resolve();
    });

    request
        .get(meta.img)
        .on('error', function () {
            deferred.reject(new Error('Error in downloading image.'));
        })
        .pipe(writeStream);

    return deferred.promise;
}

function downloadComic(args) {
    if (!args.random && !args.latest) {
        return getImageURL(XKCDBASE + args.comic + '/' + XKCDSUF)
            .then(function (meta) {
                return downloadImage(meta, args.dir, args.comic);
            });
    } else {
        // Will return the latest
        return getImageURL(XKCDBASE + XKCDSUF)
            .then(function (meta) {
                // We want latest, just return the image
                if (args.latest) {
                    return downloadImage(meta, args.dir, meta.num);
                } else {
                    // We want random
                    // meta.num is the latest xkcd number, so create random index from that number
                    var num = meta.num;
                    var rand = Math.floor(Math.random() * num) + 1;
                    return getImageURL(XKCDBASE + rand + '/' + XKCDSUF)
                        .then(function (meta) {
                            return downloadImage(meta, args.dir);
                        });
                }
            });
    }
}

module.exports.downloadComic = downloadComic;