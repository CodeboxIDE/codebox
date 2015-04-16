var $ = require("jquery");
var Q = require("q");
var _ = require("hr.utils");
var Class = require("hr.class");


var logger = require("hr.logger")("uploader");

try {
    if (XMLHttpRequest.prototype.sendAsBinary){} else {
        XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
            function byteValue(x) {
                return x.charCodeAt(0) & 0xff;
            }
            var ords = Array.prototype.map.call(datastr, byteValue);
            var ui8a = new Uint8Array(ords);
            this.send(ui8a);
        }
    }
} catch(e) {}

var Uploader = Class.extend({
    defaults: {
        url: "",
        data: {}
    },

    /*
     *  Constructor for the uploader
     */
    initialize: function(){
        Uploader.__super__.initialize.apply(this, arguments);

        this.lock = false;
        this.maxFileSize = 10*1048576;

        return this;
    },

    /*
     *  Connect to a input file
     */
    connect: function(input) {
        var self = this;
        input.on("change", function(e) {
            e.preventDefault();
            self.upload(this.files);
        });
    },


    /*
     *  Run upload
     *  @files : html5 files
     */
    upload: function(files) {
        var d = Q.defer();
        var totalFilesSize = 0;
        var that = this;

        if (that.lock == true) {
            return Q.reject("Upload already in progress");
        }

        // Calcul total files size
        totalFilesSize = _.reduce(files, function(memo, file){ return memo + (file.size != null ? file.size : 0); }, 0);

        _.reduce(files, function(d, file) {
            return d.then(function() {
                return that.uploadFile(file);
            });
        }, Q({})).then(function() {
            d.resolve();
        }, function(err) {
            d.reject(err);
        }, function(progress) {
            d.notify(progress);
        });

        return d.promise;
    },

    /*
     *  Upload one file
     */
    uploadFile: function(file) {
        var that = this;
        var d = Q.defer();
        var filename = file.webkitRelativePath || file.name;

        var error = function(err) {
            logger.error("error uploading", filename, ":", err);
            that.trigger("error", err);
            that.lock = false;
            d.reject(err);
        }

        var progress = function(percent) {
            logger.log("notify ", filename, percent);
            that.trigger("state", percent);
            d.notify({
                'filename': filename,
                'percent': percent
            });
        };

        var end = function(text) {
            logger.log("end", text);
            that.trigger("end", text);
            that.lock = false;
            d.resolve(text);
        };

        if (file.name == "." ||  file.name == "..") {
            return Q();
        }

        if (file.name == null || file.size == null || file.size >= that.maxFileSize) {
            return Q.reject(new Error("Invalid file or file too big"));
        }

        that.lock = true;

        logger.log("upload file ", filename, " in ", that.options.url, file.size,"/", file.size);

        var xhr = new XMLHttpRequest(),
            upload = xhr.upload,
            start_time = new Date().getTime(),
            uploadurl = that.options.url.replace(":file", filename);

        logger.log("start uploading ", filename);

        upload.file = file;
        upload.downloadStartTime = start_time;
        upload.currentStart = start_time;
        upload.currentProgress = 0;
        upload.startData = 0;
        upload.addEventListener("progress",function(e){
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / file.size);
                progress(percentage);
            }
        }, false);

        xhr.open("PUT", uploadurl, true);
        xhr.onreadystatechange = function(e){
            if (xhr.status != 200)  {
                error(new Error(xhr.status+": "+xhr.responseText));
                e.preventDefault();
                return;
           }
        };

        var formData = new FormData();
        formData.append(filename, file);
        _.each(that.options.data, function(v, k) {
            formData.append(k, JSON.stringify(v));
        });

        progress(0);
        xhr.onload = function() {
            if (xhr.status == 200) {
                end(xhr.responseText || "");
            }
        }

        xhr.send(formData);

        return d.promise;
    }
}, {
    // Upload file
    upload: function(options) {
        var d = Q.defer();

        options = _.defaults({}, options || {}, {
            'url': null,
            'data': {},
            'directory': false,
            'multiple': true
        });

        // Uploader
        var uploader = new Uploader(options);

        var $f = $("input.cb-file-uploader");
        if ($f.length == 0) {
            var $f = $("<input>", {
                "type": "file",
                "class": "cb-file-uploader"
            });
            $f.appendTo($("body"));
        }

        $f.hide();

        $f.prop("webkitdirectory", options.directory);
        $f.prop("directory", options.directory);
        $f.prop("multiple", options.multiple);

        // Create file element for selection
        $f.change(function(e) {
            e.preventDefault();

            uploader.upload(e.currentTarget.files)
            .progress(function(p) {
                d.notify(p.percent);
            })
            .then(function() {
                d.resolve()
            }, function(err) {
                d.reject(err);
            })
            .fin(function() {
                $f.remove();
            });
        });
        $f.trigger('click');

        return d.promise;
    }

});

module.exports = Uploader;
