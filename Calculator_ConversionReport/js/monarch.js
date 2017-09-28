(function () {
    var monarchApp,
      __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    monarchApp = angular.module('monarchApp', ['infinite-scroll', 'ngDropdowns', 'ui.multiselect']);

    monarchApp.factory('dataFactory', function ($window) {
        var data, group, grouping, id, message, total, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;
        data = {
            'metadata': $window.metadata,
            'messages': $window.data.messages,
            'notes': (typeof $window.notes === "undefined" || $window.notes === null) ? [] : $window.notes,
            'limits': [],
            'shouldDisplayMessages': []
        };

        data.notesModified = false;
        data.statusModified = false;

        for (i = 0; i < data.notes.length; i++) {
            var index = 0;
            switch (data.notes[i].Status) {
                case "open": index = 0;
                    break;
                case "flagged": index = 1;
                    break;
                case "complete": index = 2;
                    break;
                default: break;
            }
            if (i < data.messages.length) {
                data.messages[i].status = index;
                data.messages[i].notes = data.notes[i].Value;
                if (index != 0) {
                    data.statusModified = true;
                }
                if (data.notes[i].Value && 0 != data.notes[i].Value.length) {
                    data.notesModified = true;
                }
            }
        }
        var heading = [{ name: data.metadata.GroupHeadings[0], class: 'None', activeClass: 'None' }, { name: data.metadata.GroupHeadings[1], class: 'severity', activeClass: 'all' },
            { name: data.metadata.GroupHeadings[2], class: 'id', activeClass: 'all' }, { name: data.metadata.GroupHeadings[3], class: 'files', activeClass: 'all' },
            { name: data.metadata.GroupHeadings[4], class: 'category', activeClass: 'all' }];

        data.isInProduct = typeof (engine) != "undefined";

        data.InjectCssFile = function (fileName, document) {
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", fileName);
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }

        var angularDropDownCssFile = data.isInProduct ? "css/angular-dropdowns_inproduct.css" : "css/angular-dropdowns.css";
        var monarchCssFile = data.isInProduct ? "css/monarch_inproduct.css" : "css/monarch.css";
        var bootstrapCssFile = data.isInProduct ? "css/bootstrap_inproduct.css" : "css/bootstrap.css";        

        data.InjectCssFile(angularDropDownCssFile, document);
        data.InjectCssFile(bootstrapCssFile, document);
        data.InjectCssFile(monarchCssFile, document);      
        

        data.project = $window.data.converted_project;
        document.title = data.project + " Conversion Report";
        data.time = $window.data.time_to_convert;
        data.VIs = $window.data.converted_VIs;
        data.limit = 20;

        data.defaultNotesValue = data.isInProduct ? "Click here to add notes" : "";
        data.expanded = !data.isInProduct;
        data.hideOnlyOnlineStyle = data.isInProduct ? "display:none;" : "display:block;";
        data.displayInlineBlockOffline = data.isInProduct ? "display:none;" : "display:inline-block;";
        data.hideOnlyOfflineStyle = data.isInProduct ? "display : inline-block;" : "display:none;";
        data.groupingTabs = heading;
        data.showIcon = [true];
        data.showText = [false];


        data.notesIndex = 6;
        data.categoryIndex = 5;
        data.statusIndex = 7;
        data.severityIndex = 0;
        data.fileIndex = 4;

        data.InitializeDefaultWidths = function () {
            data.onlineCoulmnWidth = [10, 10, 34, 10, 13, 12, 6, 5];
            data.offlineColumnWidth = [15, 15, 36, 10, 12, 12, 0, 0];
            // This is needed since expandedNotesColWidth reference is shared among different groupings
            data.expandedNotesdefaultWidth = [10, 8, 25, 8, 12, 12, 20, 5];

            if (data.notesModified) {
                data.offlineColumnWidth[data.notesIndex] += 5;
                data.offlineColumnWidth[data.severityIndex] -= 5;
            }
            if (data.statusModified) {
                data.offlineColumnWidth[data.statusIndex] += 5;
                data.offlineColumnWidth[data.categoryIndex] -= 5;
            }
            else if (!data.isInProduct) {
                data.expandedNotesdefaultWidth[data.statusIndex] -= 5;
                data.expandedNotesdefaultWidth[data.severityIndex] += 5;
            }

            data.maxWidth = 1000;
            data.stripwidth = 4;
            data.columnWidth = [0, 0, 0, 0, 0, 0, 0];
            data.expandedNotesColWidth = [0, 0, 0, 0, 0, 0, 0];
            for (i = 0; i < data.expandedNotesColWidth.length ; i++) {
                data.expandedNotesColWidth[i] = data.expandedNotesdefaultWidth[i];
            }
            data.iconNotesColWidth = [10, 40, 15, 15, 10, 5, 5];
            data.totalStripWidth = data.stripwidth * (data.columnWidth.length - 1);
        }

        data.InitializeDefaultWidths();
        data.setWidth = function () {
            data.maxWidth = data.isInProduct ? screen.width : 1000;
            data.setCoulmnWidth();

            data.stripwidthpercentage = data.stripwidth / data.maxWidth * 100;
            // Reinitialize without changing the reference
            for (i = 0; i < data.expandedNotesColWidth.length ; i++) {
                data.expandedNotesColWidth[i] = data.expandedNotesdefaultWidth[i];
            }

            for (i = 0; i < data.columnWidth.length; i++) {
                data.columnWidth[i] -= data.stripwidthpercentage;
                data.expandedNotesColWidth[i] -= data.stripwidthpercentage;
            }
        };

        data.setCoulmnWidth = function () {
            for (i = 0; i < data.columnWidth.length ; i++) {
                if (data.isInProduct) {
                    data.columnWidth[i] = data.onlineCoulmnWidth[i];
                }
                else {
                    data.columnWidth[i] = data.offlineColumnWidth[i];
                }
            }
        };

        data.setCoulmnWidth();
        data.groupings = [];
        for (i = 1; i < heading.length; i++) {
            data.groupings[i - 1] = heading[i].class;
        }
        data.groupings[i] = 'object'; // Hack : Explicitly add object grouping. We don't want this in groupingTabs but want it in data[grouping]
        // ['category', 'severity', 'object', 'files', 'node'];

        for (_i = 0, _len = data.groupings.length; _i < _len; _i++) {
            grouping = data.groupings[_i];
            data[grouping] = {
                'groupNames': []
            };
            data.limits[grouping] = {};
        }

        id = 0;
        _ref = data.messages;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            message = _ref[_j];
            message['index'] = id += 1;
            message['id'] = message.messageId;
            message['note'] = '';
            message['node'] = 'cgObjectId' in message ? 'Node' : 'Unknown';
            for (_k = 0, _len2 = data.groupings.length; _k < _len2; _k++) {
                grouping = data.groupings[_k];
                data[grouping][message[grouping]] = message[grouping] in data[grouping] ? data[grouping][message[grouping]] + 1 : 1;
                if (_ref1 = message[grouping], __indexOf.call(data[grouping]['groupNames'], _ref1) < 0) {
                    data[grouping]['groupNames'].push(message[grouping]);
                }
            }
        }


        for (_l = 0, _len3 = data.groupings.length; _l < _len3; _l++) {
            grouping = data.groupings[_l];
            data[grouping]['groupNames'].sort();
            total = 0;
            _ref2 = data[grouping]['groupNames'];
            for (_m = 0, _len4 = _ref2.length; _m < _len4; _m++) {
                group = _ref2[_m];
                total += data[grouping][group];
            }
            data[grouping]['bars'] = (function () {
                var _len5, _n, _ref3, _results;
                _ref3 = data[grouping]['groupNames'];
                _results = [];
                for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
                    group = _ref3[_n];
                    _results.push(data[grouping][group] / total * 100);
                }
                return _results;
            })();
            data[grouping]['count'] = (function () {
                var _len5, _n, _ref3, _results;
                _ref3 = data[grouping]['groupNames'];
                _results = [];
                for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
                    group = _ref3[_n];
                    _results.push(data[grouping][group]);
                }
                return _results;
            })();
            data[grouping]['filtered'] = (function () {
                var _len5, _n, _ref3, _results;
                _ref3 = data[grouping]['groupNames'];
                _results = {};
                for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
                    group = _ref3[_n];
                    _results[group] = false;
                }
                return _results;
            })();
            data[grouping]['expanded'] = (function () {
                var _len5, _n, _ref3, _results;
                _ref3 = data[grouping]['groupNames'];
                _results = {};
                for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
                    group = _ref3[_n];
                    _results[group] = !data.isInProduct;
                }
                return _results;
            })();
        }
        for (i = 0 ; i < data.groupings.length; i++) {
            data.shouldDisplayMessages[i] = false;
        }

        // This function is called everytime the user scrolls the html page.
        // It is also called when changing tabs ( None, Severity, etc... ) and when users edit the search textbox.
        // A sub-group ( under a specific group ) could either be filtered or in collapsed/expanded state.
        data.displayMessages = function () {
            for (i = 0, len = data.groupings.length; i < len; i++) {
                grouping = data.groupings[i];
                tempLimit = data.shouldDisplayMessages[i] ? data.limit : 0;
                groupNames = data[grouping]['groupNames'];

                for (j = 0; j < groupNames.length; j++) {
                    subGroup = groupNames[j];
                    // Check for filtered groupNames and for collapsed groupNames              
                    if (data[grouping]['filtered'][subGroup] || !data[grouping]['expanded'][subGroup]) {
                        data.limits[grouping][subGroup] = 0;
                        continue;
                    }

                    count = data[grouping][subGroup];
                    if (count > tempLimit) {
                        data.limits[grouping][subGroup] = tempLimit;
                        tempLimit = 0;
                    }
                    else {
                        data.limits[grouping][subGroup] = count;
                        tempLimit -= count;
                    }
                }
            }
        };

        data.displayMessages();

        data.ddSeverityList = [], data.ddObjectsList = [], data.ddFilesList = [], data.ddCategoryList = [], data.ddIdList = [];
        data.selectedSeverityList = [], data.selectedObjectsList = [], data.selectedFileList = [], data.selectedCategoryList = [], data.selectedIdList = [];
        data.disabledSeverityList = [], data.disabledObjectsList = [], data.disabledFileList = [], data.disabledCategoryList = [], data.disabledIdlist = [];

        data.updateDropDownList = function () {
            for (i = 0; i < data.groupings.length; i++) {
                grouping = data.groupings[i];
                data[grouping]['groupNames'].forEach(function (val) {
                    if (grouping == 'severity') {
                        data.ddSeverityList.push({ name: val });
                    }
                    if (grouping == 'object') {
                        data.ddObjectsList.push({ name: val });
                    }
                    if (grouping == 'id') {
                        data.ddIdList.push({ name: val });
                    }
                    if (grouping == 'files') {
                        data.ddFilesList.push({ name: val });
                    }
                    if (grouping == 'category') {
                        data.ddCategoryList.push({ name: val });
                    }

                });
            }
        };

        //Set all list items as checked.
        data.initializeDDList = function () {
            data.ddSeverityList.forEach(function (item) {
                data.selectedSeverityList.push(item.name);
            });
            data.ddObjectsList.forEach(function (item) {
                data.selectedObjectsList.push(item.name);
            });
            data.ddFilesList.forEach(function (item) {
                data.selectedFileList.push(item.name);
            });
            data.ddCategoryList.forEach(function (item) {
                data.selectedCategoryList.push(item.name);
            });
            data.ddIdList.forEach(function (item) {
                data.selectedIdList.push(item.name);
            });
        }

        data.updateDropDownList();
        data.initializeDDList();
        //Set data structure
        data.StringSet = function StringSet() {
            var setObj = {}, val = {};

            this.add = function (str) {
                setObj[str] = val;
            };

            this.contains = function (str) {
                return setObj[str] === val;
            };

            this.remove = function (str) {
                delete setObj[str];
            };

            this.values = function () {
                var values = [];
                for (var i in setObj) {
                    if (setObj[i] === val) {
                        values.push(i);
                    }
                }
                return values;
            };
        };


        data.setTab = function ($event, index) {
            // Reset everything.
            for (i = 0; i < data.groupings.length; i++) {
                data.shouldDisplayMessages[i] = false;
                data.limit = 20;
            }

            if (index != 1) {
                // because we are passing $index + 1, and 0th index is None tab.
                data.shouldDisplayMessages[index - 2] = true;
                data.displayMessages();
            }
            return data.activeTab = index;
        };
        return data;
    });

    monarchApp.controller('TabController', [
      '$scope', 'dataFactory', function ($scope, dataFactory) {
          $scope.data = dataFactory;
          $scope.notes = dataFactory.notes;
          if($scope.data.isInProduct) {
			    $scope.data.activeTab = $scope.data.fileIndex;
			    $scope.data.setTab(null, $scope.data.fileIndex);
		   } else {
			    $scope.data.activeTab=1;
		   }
            $scope.loadMoreMessages = function () {
              $scope.data.limit += 4;
              $scope.data.displayMessages();
          };

          $scope.severity = {
              index: 4,
              legends: $scope.data['severity']['groupNames'],
              bars: $scope.data['severity']['bars'],
              count: $scope.data['severity']['count']
          };

          $scope.loadMoreMessages = function () {
              $scope.data.limit += 5;
              $scope.data.displayMessages();
          };

          return $scope.setTab = function ($event, index) {
              return $scope.data.setTab($event, index);
          };
      }
    ]);
}).call(this);