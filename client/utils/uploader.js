define([
    'hr/hr',
    'hr/promise',
    'hr/dom',
    'hr/utils'
],function(hr, Q, $, _) {
    var logging = hr.Logger.addNamespace("uploader");

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

    var Uploader = hr.Class.extend({
        defaults: {
            directory: null
        },

        /*
         *  Constructor for the uploader
         */
        initialize: function(){
            Uploader.__super__.initialize.apply(this, arguments);

            this.directory = this.options.directory
            this.codebox = this.directory.codebox;
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
                logging.error("error uploading", filename, ":", err);
                that.trigger("error", err);
                that.lock = false;
                d.reject(err);
            }

            var progress = function(percent) {
                logging.log("notify ", filename, percent);
                that.trigger("state", percent);
                d.notify({
                    'filename': filename,
                    'percent': percent
                });
            };

            var end = function(text) {
                logging.log("end", text);
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

            logging.log("upload file ", filename, " in ", that.directory.exportUrl(), file.size,"/", file.size);

            var send = function(e){
                var xhr = new XMLHttpRequest(),
                    upload = xhr.upload,
                    start_time = new Date().getTime(),
                    uploadurl = that.directory.exportUrl()+filename;

                if (e.target.result == null) {
                    error(new Error("Error reading file"));
                    return;
                }
                
                logging.log("start uploading ", filename);
                
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
                xhr.sendAsBinary(e.target.result);  
                progress(0);
                xhr.onload = function() {
                    if (xhr.status == 200) {
                        end(xhr.responseText || "");
                    }
                }
            };

            var reader = new FileReader();
            reader.onloadend = send;
            reader.readAsBinaryString(file);

            return d.promise;
        }
    });
    
    return Uploader;
});