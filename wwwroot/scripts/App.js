class Application {
    static HandleFiles(element) {
        var me = this;
        Application.zipContent = [];
        Array.from(element.files).forEach((file) => {
            if (file != null) {
                JSZip.loadAsync(file) // 1) read the Blob
                    .then(function (zip) {
                    const promises = [];
                    zip.forEach(function (relativePath, zipEntry) {
                        console.log(relativePath + " > " + zipEntry.name);
                        const promise = zipEntry.async('string');
                        promises.push(promise);
                        promise.then(p => {
                            Application.zipContent.push({
                                file: relativePath,
                                content: p
                            });
                        });
                    });
                    Promise.all(promises).then(ps => {
                        Application.FilesReady();
                    });
                }, function (e) {
                    console.log("Error reading " + file.name + ": " + e.message);
                });
            }
        });
    }
    static FilesReady() {
        console.log("Files Ready");
        //console.log(Application.zipContent);
        /*  for (var a = 0; a <= Application.zipContent.length; a++) {    //Csak azoknak a nevét iratom ki, amelyek Database/Bcp -vel kezdődnek.
             if (Application.zipContent[a].file.startsWith("Database/Bcp")){
                 console.log(Application.zipContent[a].file);
                =
             }
     }*/
        this.BCPfiles = this.ProcessFiles(Application.zipContent);
        this.UploadUnorderedList(this.BCPfiles);
    }
    static ProcessFiles(files) {
        var result = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.file.startsWith("Database/Bcp")) { //Csak azokat teszem bele a result tömbbe, amelyek Database/Bcp -vel kezdődnek.
                var bcpfile = BCP.File.CreateBCPFile(file.content, file.file);
                result.push(bcpfile); //elemenként feltölti a result tömböt
                // break;   //az első elem feltöltése után megállítjuk a ciklust
            }
        }
        return result;
    }
    //var items = result.Where(i => i.Rows.length > 10 && i.Name.indexOf("ss") > -1);
    static UploadUnorderedList(files) {
        var filediv = document.querySelector(".files> ul");
        // console.log(filediv);
        var html = '';
        for (var i = 0; i < files.length; i++) {
            html += '<li> <a href="#' + files[i].Name + '" onclick2="Application.ShowTable(Application.BCPfiles, ' + i + ')">' + files[i].Name + '</a></li>';
            filediv.innerHTML = html;
        }
        //this.ShowTable(this.BCPfiles, 1);
    }
    static ShowTable(file, name) {
        var contentdiv = document.querySelector(".content> table");
        var d1 = new Date();
        var header = '';
        header += '<caption>' + file[name].Name + '</caption>';
        header += '<tr>';
        var table = '';
        header += '<th>' + file[name].Columns[0].name + '</th>';
        for (var z = 1; z < file[name].Columns.length; z++) {
            if (file[name].Columns[z].name.endsWith("_id")) {
                /*var id = file[name].Columns[z].name.slice(0,-3);*/
                var colname = file[name].Columns[z].name;
                var ix = this.SearchInArray(colname);
                if (ix >= 0) {
                    var url = "#" + this.BCPfiles[ix].Name;
                    header += '<th> <a href="' + url + '" onclick2="Application.ShowTable(Application.BCPfiles, ' + ix + ')">' + file[name].Columns[z].name + '</a></th>';
                }
                else
                    header += '<th>' + file[name].Columns[z].name + '</th>';
            }
            else {
                header += '<th>' + file[name].Columns[z].name + '</th>';
            }
        }
        header += '</tr>';
        table += '<tr>';
        for (var i = 1; i < file[name].Rows.length; i++) {
            for (var j = 0; j < file[name].Rows[i].length; j++) {
                var RowContent = HtmlEncode(file[name].Rows[i][j]);
                table += '<td>' + RowContent + '</td>';
            }
            table += '</tr>';
        }
        var all = '';
        all += header + table;
        var d2 = new Date();
        console.log(d2.getTime() - d1.getTime());
        contentdiv.innerHTML = all;
    }
    static SearchInArray(name) {
        var result = -1;
        var TableName = this.GetFileName(name);
        for (var i = 0; i < this.BCPfiles.length; i++) {
            if (this.BCPfiles[i].Name == TableName) {
                return i;
            }
        }
        return result;
    }
    static GetFileName(columnname) {
        var file = this.BCPfiles;
        var names = [];
        var TableName = columnname.slice(0, -3);
        for (var a = 0; a < file.length; a++) {
            var Nam;
            var prefix = "t_fsc2_";
            if (file[a].Name.startsWith("t_fsc2_")) {
                Nam = file[a].Name.slice(7);
            }
            else if (file[a].Name.startsWith("t_fsc_")) {
                prefix = "t_fsc_";
                Nam = file[a].Name.slice(6);
            }
            if (Nam == TableName) {
                return prefix + TableName;
            }
            names[a] = Nam;
        }
        return "";
    }
    static NavigateUrl(hash) {
        var tname = hash.substring(1);
        console.log(hash);
        var bcpfile = this.BCPfiles.FirstOrDefault(i => i.Name == tname);
        if (bcpfile != null) {
            this.ShowTable(this.BCPfiles, this.BCPfiles.indexOf(bcpfile));
        }
    }
    static TableClicked(event) {
        let el = event.target;
        console.log(el);
        if (el.tagName == "TD") {
            var x = Array.from(el.parentNode.children).indexOf(el);
            console.log(x);
        }
    }
}
Application.zipContent = [];
Application.BCPfiles = [];
window.addEventListener("hashchange", function () {
    console.log("ASD");
    Application.NavigateUrl(window.location.hash);
});
//# sourceMappingURL=App.js.map