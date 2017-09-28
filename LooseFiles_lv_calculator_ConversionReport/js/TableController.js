angular.module('monarchApp').controller('TableController', [
  '$scope', 'filterFilter', 'dataFactory', function ($scope, filterFilter, dataFactory) {
      $scope.data = dataFactory;
      $scope.notes = dataFactory.notes;
      $scope.predicate = $scope.grouping || 'severity';
      $scope.reverse = false;

      $scope.columnWidth = dataFactory.columnWidth;
      $scope.maxWidth = dataFactory.maxWidth;
      $scope.totalStripWidth = dataFactory.totalStripWidth;
      $scope.expandedNotesColWidth = dataFactory.expandedNotesColWidth;

      $scope.iconNotesColWidth = dataFactory.iconNotesColWidth;
      $scope.notesIndex = -1;
      $scope.currentGrouping = "none";
      $scope.activeNotesEditTextArea = null;
      $scope.activeNotesTextArea = null;
      $scope.showIcon = dataFactory.showIcon[0];
      $scope.showText = dataFactory.showText[0];
      $scope.filteredMessages = $scope.data.messages;

      $scope.filterMessages = function () {
          var searchObj = {};
          searchObj[$scope.grouping || '$'] = $scope.search;
          $scope.filteredMessages = filterFilter($scope.filteredMessages, searchObj);
      };

      $(window).load(function () {
          $scope.data.setWidth();
          $scope.$apply();
      });
      $(window).resize(function () {
          $scope.data.setWidth();
          $scope.$apply();
      });

      $scope.NotToUpdate = new $scope.data.StringSet();

      $scope.ddSelectOptions = [
        {
            text: 'CSV'
        },
        {
            text: 'XML'
        }
      ];

      $scope.ddSelectSelected = {};

      $scope.doAction = function (option) {
          $scope.filterMessages();
          if (option.text == "CSV")
              $scope.exportTableToCsv();
          else if (option.text == "XML")
              $scope.exportTableToXml();
      };

      $scope.format = function (message) {
          var formattedMessage = message.replace(new RegExp("\"", 'g'), "\"\"");
          formattedMessage = "\"" + formattedMessage + "\"";
          return formattedMessage;
      };

      $scope.exportTableToCsv = function () {
          var messages = $scope.filteredMessages;
          input = "Severity,Id,Description,ConvertedFile,OriginalFile,Category\n";
          for (i = 0; i < messages.length; i++) {
              input += messages[i].severity + "," + messages[i].id + "," + $scope.format(messages[i].object) + "," + messages[i].newPath.split('\\').pop() + "," + messages[i].files.split('\\').pop() + "," + messages[i].category + "\n";
          }
          var blob = new Blob([input], { type: 'text/csv' });
          saveAs(blob, "report.csv");
      };

      $scope.exportTableToXml = function () {
          var xml = '<?xml version="1.0" encoding="utf-8"?>';
          xml += '<ConversionMessages>';
          var messages = $scope.filteredMessages;
          for (i = 0; i < messages.length; i++) {
              xml += '<Message><Severity>' + messages[i].severity + '</Severity><MessageId>' + messages[i].id + '</MessageId><Object>' + messages[i].object + '</Object><ConvertedFile>' + messages[i].newPath.split('\\').pop() + '</ConvertedFile><OriginalFile>' + messages[i].files.split('\\').pop() + '</OriginalFile><Category>' + messages[i].category + '</Category></Message>';
          }
          xml += '</ConversionMessages>';
          var blob = new Blob([xml], { type: 'application/xml' });
          saveAs(blob, "report.xml");
      };

      $scope.OnGroupingExpandedOrCollapsed = function (grouping, subGroup, $event) {
          if (typeof $event.target.id === "undefined" || $event.target.id != "expandable") {
              return;
          }
          if (typeof $scope.data[grouping]['expanded'][subGroup] != "undefined") {
              $scope.data[grouping]['expanded'][subGroup] = !$scope.data[grouping]['expanded'][subGroup];
          }
          $scope.data.displayMessages();
      };

      $scope.setTab = function ($event, index) {
          return $scope.data.setTab($event, index);
      };
      $scope.change = function () {
          if ($scope.notesIndex == -1) return;
          textValue = $scope.activeNotesEditTextArea.value;
          $scope.activeNotesEditTextArea.style.display = "none";
          scopeIndex = $scope.notesIndex;
          textValueDiv = document.getElementById("NotesTextValueDiv" + $scope.notesIndex + $scope.currentGrouping);
          $scope.data.messages[$scope.notesIndex].notes = textValue;
          document.getElementById("NotesTextDiv" + $scope.notesIndex + $scope.currentGrouping).style.display = "block";
          $scope.activeNotesTextArea = null;
          $scope.activeNotesEditTextArea = null;

          $scope.notesIndex = -1;
          $scope.currentGrouping = "none";

          if ($scope.data.isInProduct) {
              // by default the radix is 8
              var integerIndex = parseInt(scopeIndex, 10);
              engine.trigger('UpdateNotes', textValue, integerIndex);
          }
      };

      $scope.checkNotesWidth = function () {
          if ($scope.data.isInProduct || $scope.data.notesModified) {
              $scope.data.showIcon[0] = $scope.columnWidth[$scope.data.notesIndex] < 15;
              $scope.data.showText[0] = $scope.columnWidth[$scope.data.notesIndex] >= 15;
              $scope.change();
          }
      }

      $scope.showIcons = function ($event, index) {
          for (var i = $scope.columnWidth.length - 1; i >= 0; i--) {
              $scope.columnWidth[i] = $scope.iconNotesColWidth[i];
          };
          $scope.checkNotesWidth();
      }

      $scope.showEditTextArea = function ($event, index, grouping) {
          if ($scope.data.isInProduct) {
              $scope.activeNotesTextArea = document.getElementById("NotesTextDiv" + index + grouping);
              $scope.activeNotesTextArea.style.display = "none";
              notesEditTextArea = document.getElementById("NotesEditTextArea" + index + grouping);
              notesEditTextArea.style.display = "block";
              $scope.notesIndex = index;
              $scope.currentGrouping = grouping;
              notesEditTextArea.value = $scope.data.messages[index].notes;
              notesEditTextArea.focus();
              notesEditTextArea.select();
              $scope.activeNotesEditTextArea = notesEditTextArea;
          }
      }
      $scope.showNotes = function ($event, index, grouping) {
          isEmptyText = $scope.data.messages[index].notes === null || typeof $scope.data.messages[index].notes === "undefined" || $scope.data.messages[index].notes === "";
          // In offline only expand for non empty notes
          if (((!$scope.data.isInProduct && !isEmptyText)) || ($scope.data.isInProduct)) {
              $scope.change();
              for (var i = $scope.columnWidth.length - 1; i >= 0; i--) {
                  $scope.iconNotesColWidth[i] = $scope.columnWidth[i];
                  $scope.columnWidth[i] = $scope.expandedNotesColWidth[i];
              };
              $scope.checkNotesWidth();
              if ($scope.data.isInProduct && isEmptyText) {
                  $scope.showEditTextArea($event, index, grouping);
              }
          }
          return;
      }

      $scope.changeStatusImage = function (index) {
          if ($scope.data.isInProduct) {
              $scope.data.messages[index].status = ($scope.data.messages[index].status + 1) % 3;
              // by default the radix is 8
              var integerIndex = parseInt(index, 10);
              engine.trigger('UpdateConversionMessageStatus', $scope.data.messages[index].status, integerIndex);
          }
      }

      $scope.highlightItem = function (viName, nodeId) {
          if ($scope.data.isInProduct) {
              if (typeof viName === "undefined") return;

              viName = viName.split('\\').pop();   // We want just the VI name, not the VI path.
              if (typeof nodeId === "undefined") { // Open VI
                  engine.trigger('OpenDocument', viName);
                  return;
              }
              // Highlight Node
              engine.trigger('HighlightVIObject', viName, nodeId);
          }
      };

      /**
       * Makes a call and passes the predicate of the GET request to C# through coherent.js.
       */
      $scope.highlightClassicItem = function (viName, nodeId) {
          if ($scope.data.isInProduct) {
              if (typeof viName === "undefined") return;
              var request = "";
              if (typeof nodeId !== "undefined") {
                  request = "HighlightNode?Path=" + viName + "&ObjectID=" + nodeId;
              } else {
                  request = "OpenFile?Path=" + viName;
              }
              engine.call("ContactCurrentGenHelpServer", request);
          }
      };


      Array.prototype.contains = function (element) {
          return this.indexOf(element) > -1;
      };

      $scope.updateFilteredData = function (groupName, event) {

          var toFilterData = [];
          var severityList = new $scope.data.StringSet(), objectList = new $scope.data.StringSet(), filesList = new $scope.data.StringSet(), categoryList = new $scope.data.StringSet(), idList = new $scope.data.StringSet();
          var dSeverityList = new $scope.data.StringSet(), dObjectList = new $scope.data.StringSet(), dFilesList = new $scope.data.StringSet(), dCategoryList = new $scope.data.StringSet(), dIdList = new $scope.data.StringSet();

          $scope.data.selectedSeverityList.forEach(function (sev)
          {
              severityList.add(sev);
          });
          $scope.data.selectedObjectsList.forEach(function (obj) { objectList.add(obj); });
          $scope.data.selectedFileList.forEach(function (file) { filesList.add(file); });
          $scope.data.selectedCategoryList.forEach(function (category) { categoryList.add(category); });
          $scope.data.selectedIdList.forEach(function (id) { idList.add(id); });

          $scope.data.disabledSeverityList.forEach(function (sev) { dSeverityList.add(sev); });
          $scope.data.disabledObjectsList.forEach(function (obj) { dObjectList.add(obj); });
          $scope.data.disabledFileList.forEach(function (file) { dFilesList.add(file); });
          $scope.data.disabledCategoryList.forEach(function (category) { dCategoryList.add(category); });
          $scope.data.disabledIdlist.forEach(function (id) { dIdList.add(id); });

          // A message is valid if it is present in selected list or in disabled list for every group
          var isValid = function (obj) {

              if ((severityList.contains(obj.severity) || dSeverityList.contains(obj.severity)) &&
                 (objectList.contains(obj.object) || dObjectList.contains(obj.object)) &&
                 (filesList.contains(obj.files) || dFilesList.contains(obj.files)) &&
                 (categoryList.contains(obj.category) || dCategoryList.contains(obj.category)) &&
				 (idList.contains(obj.id) || dIdList.contains(obj.id))) {
                  return true;
              }
              return false;
          };
          $scope.data.messages.forEach(function (obj) {

              if (isValid(obj)) {
                  toFilterData.push(obj);
              }

              else {
                  // An unselected message in one category should be in disabled category for other groups iff in the other groups if it is present in selected category 
                  if (severityList.contains(obj.severity)) { dSeverityList.add(obj.severity); }
                  if (objectList.contains(obj.object)) { dObjectList.add(obj.object); }
                  if (filesList.contains(obj.files)) { dFilesList.add(obj.files); }
                  if (categoryList.contains(obj.category)) { dCategoryList.add(obj.category); }
                  if (idList.contains(obj.id)) { dIdList.add(obj.id); }
              }
          });


          $scope.data.disabledSeverityList = dSeverityList.values();
          $scope.data.disabledObjectsList = dObjectList.values();
          $scope.data.disabledFileList = dFilesList.values();
          $scope.data.disabledCategoryList = dCategoryList.values();
          $scope.data.disabledIdlist = dIdList.values();

          $scope.filteredMessages = toFilterData;

          $scope.updateDDList(groupName);
      };
      $scope.updateDDList = function (groupName) {
          var severityList = new $scope.data.StringSet(), objectList = new $scope.data.StringSet(), filesList = new $scope.data.StringSet(), categoryList = new $scope.data.StringSet(), idList = new $scope.data.StringSet();
          var ddsevList = [], ddobjList = [], ddfileList = [], ddcatList = [], ddidList = [];
          var unsevList = [], unobjList = [], unfileList = [], uncatList = [], unidList = [];

          $scope.filteredMessages.forEach(function (obj) {
              if (!severityList.contains(obj.severity)) {
                  severityList.add(obj.severity);
              }
              if (!objectList.contains(obj.object)) {
                  objectList.add(obj.object);
              }
              if (!filesList.contains(obj.files)) {
                  filesList.add(obj.files);
              }
              if (!categoryList.contains(obj.category)) {
                  categoryList.add(obj.category);
              }
              if (!idList.contains(obj.id)) {
                  idList.add(obj.id);
              }
          });

          $scope.data.disabledSeverityList.forEach(function (item, index, object) {
              if (severityList.contains(item)) {
                  object.splice(index, 1);
              }
          });

          $scope.data.disabledObjectsList.forEach(function (item, index, object) {
              if (objectList.contains(item)) {
                  object.splice(index, 1);
              }
          });

          $scope.data.disabledFileList.forEach(function (item, index, object) {
              if (filesList.contains(item)) {
                  object.splice(index, 1);
              }
          });

          $scope.data.disabledCategoryList.forEach(function (item, index, object) {
              if (categoryList.contains(item)) {
                  object.splice(index, 1);
              }
          });

          $scope.data.disabledIdlist.forEach(function (item, index, object) {
              if (idList.contains(item)) {
                  object.splice(index, 1);
              }
          });

          $scope.data.selectedSeverityList = severityList.values();
          $scope.data.selectedObjectsList = objectList.values();
          $scope.data.selectedFileList = filesList.values();
          $scope.data.selectedCategoryList = categoryList.values();
          $scope.data.selectedIdList = idList.values();
      };

      $scope.isFilterApplied = function (grouping) {
          if (grouping == 'severity') {
              return ($scope.data.selectedSeverityList.length + $scope.data.disabledSeverityList.length < $scope.data.ddSeverityList.length);
          }
          if (grouping == 'object') {
              return ($scope.data.selectedObjectsList.length + $scope.data.disabledObjectsList.length < $scope.data.ddObjectsList.length);
          }
          if (grouping == 'files') {
              return ($scope.data.selectedFileList.length + $scope.data.disabledFileList.length < $scope.data.ddFilesList.length);
          }
          if (grouping == 'category') {
              return ($scope.data.selectedCategoryList.length + $scope.data.disabledCategoryList.length < $scope.data.ddCategoryList.length);
          }
          if (grouping == 'id') {
              return ($scope.data.selectedIdList.length + $scope.data.disabledIdlist.length < $scope.data.ddIdList.length);
          }
          return false;
      };

      return $scope.sort = function (predicate, isReverse) {
          $scope.reverse = predicate === $scope.predicate ? isReverse : false;
          return $scope.predicate = predicate;
      };

  }
]);