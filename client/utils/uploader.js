define([
    'hr/hr',
    'jQuery',
    'Underscore'
],function(hr, $, _) {
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
            var max_file_size = 10*1048576;
            var total_files_sizes = 0;
            var self = this;

            if (self.lock == true) {
                return false;
            }

            total_files_sizes = _.reduce(files, function(memo, file){ return memo + (file.size != null ? file.size : 0); }, 0);

            _.each(files, function(file, i) {
                if (file.name == null || file.size == null || file.size >= max_file_size) return;
                var filename = file.webkitRelativePath || file.name;
                self.lock = true;

                logging.log("upload file ", filename, " in ", self.directory.exportUrl(), file.size,"/", total_files_sizes);

                var send = function(e){
                    var xhr = new XMLHttpRequest(),
                        upload = xhr.upload,
                        index = e.target.index,
                        start_time = new Date().getTime(),
                        uploadurl = self.directory.exportUrl()+filename;

                    if (e.target.result == null) return;
                    
                    logging.log("start uploading ", filename);
                    
                    upload.index = index;
                    upload.file = file;
                    upload.downloadStartTime = start_time;
                    upload.currentStart = start_time;
                    upload.currentProgress = 0;
                    upload.startData = 0;
                    upload.addEventListener("progress",function(e){
                        if (e.lengthComputable) {
                            var percentage = Math.round((e.loaded * 100) / total_files_sizes);
                            self.trigger("state", percentage);
                        }
                    }, false);
                    
                    xhr.open("PUT", uploadurl, true);
                    xhr.onreadystatechange = function(e){
                        if (xhr.status != 200)  {
                            self.trigger("error");
                            self.lock = false;
                            e.preventDefault();
                            return;
                       }
                    };
                    xhr.sendAsBinary(e.target.result);  
                    self.trigger("state", 0);
                    xhr.onload = function() {
                        if (xhr.status == 200 && xhr.responseText) {
                            self.trigger("state", 100);
                            self.trigger("end", $.parseJSON(xhr.responseText));
                            self.lock = false;
                        }
                    }
                }

                var reader = new FileReader();
                reader.index = i;
                reader.onloadend = send;
                reader.readAsBinaryString(files[i]);
            }, this);
        }
    });
    
    return Uploader;
});