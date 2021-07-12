var BCP;
(function (BCP) {
    class Tools {
        static Extract(zipfile) {
            var result = [];
            return;
        }
    }
    BCP.Tools = Tools;
    class Column {
    }
    BCP.Column = Column;
    class File {
        constructor() {
            this.Columns = [];
            this.Rows = [];
        }
        static CreateBCPFile(content, filename) {
            var bcpfile = new BCP.File();
            bcpfile.Content = content;
            bcpfile.Name = filename;
            var headerend = "</bcpx>";
            var heix = content.indexOf(headerend);
            var heixend = heix + headerend.length;
            var headerpart = content.substring(0, heixend);
            /*console.log("This is the HEADER------>");
            console.log(headerpart);*/
            this.SetHeader(bcpfile, headerpart);
            var bodypart = content.substring(heixend);
            /*console.log("This is the BODY--------->");
            console.log(bodypart);*/
            this.SetBody(bcpfile, bodypart);
            //console.log(bcpfile);
            console.log("PROCESS Successfull!!!");
            this.ReadBCPfile(bcpfile);
            return bcpfile;
        }
        static SetHeader(file, headerpart) {
            console.log("Function call SetHeader successful");
            var ColumnStrings = TextsBetween(headerpart, "<column ", " />", false);
            for (var i = 0; i < ColumnStrings.length; i++) {
                var ColumnString = ColumnStrings[i];
                var Col = new Column();
                var Parts = ColumnString.split(" ").Where(p => !IsNull(p));
                Parts.forEach(p => {
                    let kv = p.split("=");
                    let key = kv[0];
                    let value = TextBetween(kv[1], "\"", "\"");
                    Col[key] = value;
                });
                file.Columns.push(Col);
            }
            //A tábla nevének megtalálása
            var start_pos = headerpart.indexOf('table name="') + 12;
            var end_pos = headerpart.indexOf('"', start_pos);
            var text_to_get = headerpart.substring(start_pos, end_pos);
            file.Name = text_to_get;
            console.log(text_to_get);
        }
        static SetBody(file, bodypart) {
            console.log("Function call SetBody successful");
            var Body = bodypart.split(/[\r\n]+/);
            var Bodyelements;
            for (var i = 0; i < Body.length - 1; i++) {
                Bodyelements = Body[i].split("#");
                Bodyelements.pop();
                file.Rows.push(Bodyelements);
            }
        }
        static ReadBCPfile(file) {
            var xml = '';
            var x = file.Columns.length;
            xml += '<?xml version="1.0" encoding="utf-8"?>\n<bcpx version="1.0">\n <table name="';
            xml += file.Name + '">\n';
            for (var i = 0; i < file.Columns.length; i++) {
                xml += '  <column name="' + file.Columns[i].name;
                xml += '" data_type="' + file.Columns[i].data_type;
                if (file.Columns[i].expr) {
                    xml += '" expr="' + file.Columns[i].expr;
                }
                if (file.Columns[i].length) {
                    xml += '" length="' + file.Columns[i].length;
                }
                xml += '" nullable="' + file.Columns[i].nullable;
                xml += '" is_key="' + file.Columns[i].is_key;
                xml += '" insert="' + file.Columns[i].insert;
                xml += '" update="' + file.Columns[i].update + '" />\n';
            }
            xml += ' </table>\n</bcpx>';
            /*xml += "#".repeat(x) + '\n';*/
            for (var j = 0; j < file.Rows.length; j++) {
                for (var z = 0; z < file.Rows[j].length; z++) {
                    xml += file.Rows[j][z] + "#";
                }
                xml += '\n';
            }
            console.log("THIS IS THE XML FILE!!!");
            console.log(xml);
        }
    }
    BCP.File = File;
})(BCP || (BCP = {}));
//# sourceMappingURL=BCP.js.map