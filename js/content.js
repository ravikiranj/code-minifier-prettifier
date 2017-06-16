var codeMP = (function($) {
    "use strict";
    // Private
    var body = $("body"),
        mainDivId = "MAIN",
        codeMirror,
        defaultTheme = "darcula",
        defaultMode = "javascript",
        themes = ["default", "dracula"],
        modeMap = {
            "css": "text/css",
            "html": "text/html",
            "javascript": "text/javascript",
            "json": "application/json",
            "sql": "text/x-sql",
            "xml": "application/xml",
        },
        modes = Object.keys(modeMap),
        currentTheme = defaultTheme,
        currentMode = defaultMode,
        uglifyJsCompressor = UglifyJS.Compressor()
    ;

    modes.sort();

    // Public
    return  {
        minifyPrettifyJs: function(currData, beautify) {
            var ast = uglifyJS.parse(currData);
            ast.figure_out_scope();
            ast = ast.transform(uglifyJsCompressor);
            return ast.print_to_string({beautify: beautify});
        },

        nonEmptySqlFilter: function(str) {
            console.log(str);
            return str && str.length > 0 && str !== ";";
        },

        minify: function() {
            var currData = codeMirror.getValue(),
                newData = ""
            ;
            switch (currentMode) {
                case "css":
                    newData = pd.cssmin(currData);
                    break;
                case "html":
                case "xml":
                    newData = pd.xmlmin(currData);
                    break;
                case "json":
                    newData = pd.jsonmin(currData);
                    break;
                case "sql":
                    var sqlStatements = currData.split(";");
                    var minifiedSql = $.map(sqlStatements, function(sqlStatement) {
                        return pd.sqlmin(sqlStatement + ";").trim();
                    });
                    newData = minifiedSql.filter(this.nonEmptySqlFilter).join("\n");
                    break;
                case "javascript":
                    newData = this.minifyPrettifyJs(currData, false);
                    break;
                default:
                    newData = this.minifyPrettifyJs(currData, false);
                    break;
            }
            codeMirror.setValue(newData);
        },

        prettify: function() {
            var currData = codeMirror.getValue(),
                newData = ""
            ;
            switch (currentMode) {
                case "css":
                    newData = pd.css(currData);
                    break;
                case "html":
                case "xml":
                    newData = pd.xml(currData);
                    break;
                case "json":
                    newData = pd.json(currData);
                    break;
                case "sql":
                    var sqlStatements = currData.split(";");
                    var prettifiedSql = $.map(sqlStatements, function(sqlStatement) {
                        return sqlFormatter.format(sqlStatement + ";", "SQL").trim();
                    });
                    newData = prettifiedSql.filter(this.nonEmptySqlFilter).join("\n\n");
                    break;
                case "javascript":
                    newData = this.minifyPrettifyJs(currData, true);
                    break;
                default:
                    newData = this.minifyPrettifyJs(currData, true);
                    break;
            }
            codeMirror.setValue(newData);
        },

        initSelectDropdowns: function() {
            $("select").selectpicker({
                style: 'btn-default',
                size: 10,
                width: 'auto'
            });
        },

        registerEventHandlers: function() {
            var self = this;
            $("#MINIFY").click(function() {
                self.minify();
            });

            $("#PRETTIFY").click(function() {
                self.prettify();
            });

            $("#THEME").change(function() {
                self.updateTheme($("#THEME").val());
            });

            $("#MODE").change(function() {
                self.updateMode($("#MODE").val());
            });
        },

        saveToLocalStorage: function(key, value) {
            if (typeof(Storage) === "undefined") {
                // No local storage support
                return false;
            }

            localStorage.setItem(key, value);
            return true;
        },

        getFromLocalStorage: function(key) {
            if (typeof(Storage) === "undefined") {
                // No local storage support
                return null;
            }

            return localStorage.getItem(key);
        },

        updateTheme: function(themeName) {
            themeName = $.inArray(themeName, themes) != -1 ? themeName : defaultTheme;
            currentTheme = themeName;
            if (codeMirror) {
                codeMirror.setOption("theme", themeName);
            }
            this.saveThemeChoice(themeName);
        },

        updateMode: function(modeName) {
            modeName = $.inArray(modeName, modes) != -1 ? modeName : defaultMode;
            currentMode = modeName;
            if (codeMirror) {
                codeMirror.setOption("mode", modeMap[modeName]);
            }
            this.saveModeChoice(modeName);
        },

        saveThemeChoice: function(themeName) {
            this.saveToLocalStorage("theme", themeName);
        },

        saveModeChoice: function(modeName) {
            this.saveToLocalStorage("mode", modeName);
        },

        retrieveAndUpdateSettings: function() {
            var savedTheme = this.getFromLocalStorage("theme"),
                savedMode = this.getFromLocalStorage("mode"),
                themeDropdown = $("#THEME"),
                modeDropdown = $("#MODE")
            ;
            if ($.inArray(savedTheme, themes) === -1) {
                savedTheme = defaultTheme;
                this.saveToLocalStorage("theme", savedTheme);
            }
            if ($.inArray(savedMode, modes) === -1) {
                savedMode = defaultMode;
                this.saveToLocalStorage("mode", savedMode);
            }

            currentTheme = savedTheme;
            themeDropdown.val(currentTheme);
            themeDropdown.selectpicker("refresh");

            currentMode = savedMode;
            modeDropdown.val(currentMode);
            modeDropdown.selectpicker("refresh");
        },

        initCodeMirror: function() {
            codeMirror = CodeMirror(document.getElementById(mainDivId), {
                value: "var test = 1;",
                mode: modeMap[currentMode],
                indentUnit: 4,
                lineNumbers: true,
                theme: currentTheme
            });
            codeMirror.setSize("100%", "100%");
        },

        init: function() {
            this.registerEventHandlers();
            this.initSelectDropdowns();
            this.retrieveAndUpdateSettings();
            this.initCodeMirror();
        }
    };
})(jQuery);

$(document).ready(function(){
    codeMP.init();
});
