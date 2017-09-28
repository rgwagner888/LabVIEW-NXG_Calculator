angular.module('monarchApp').directive('colResize', ['$document', function ($document) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {

            var startX = 0, previousItemStartWidthPercentage = 0, nextItemStartWidthPercentage = 0;
            var previousItemIndex = attr.index;
            var nextItemIndex = parseInt(attr.index, 10) + 1;
            var minmumWidthPercentage = 4;

            element.on('mousedown', function (event) {
                event.preventDefault();
                startX = event.pageX;
                previousItemStartWidthPercentage = scope.columnWidth[previousItemIndex];
                nextItemStartWidthPercentage = scope.columnWidth[nextItemIndex];
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                var diffInWidth = (event.pageX - startX);
                var diffInPercentage = diffInWidth * 100 / (scope.data.maxWidth - scope.data.totalStripWidth);
                var maxWidth = previousItemStartWidthPercentage + nextItemStartWidthPercentage;
                if (previousItemStartWidthPercentage + diffInPercentage < maxWidth && previousItemStartWidthPercentage + diffInPercentage > minmumWidthPercentage &&
                   nextItemStartWidthPercentage - diffInPercentage < maxWidth && nextItemStartWidthPercentage - diffInPercentage > minmumWidthPercentage) {
                    scope.columnWidth[previousItemIndex] = previousItemStartWidthPercentage + diffInPercentage;
                    scope.columnWidth[nextItemIndex] = nextItemStartWidthPercentage - diffInPercentage;
                }
                scope.$apply();
                scope.checkNotesWidth();
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        }
    }

}]);

angular.module('monarchApp').directive('tableData', function () {
    return {
        restrict: 'E',
        scope: {
            grouping: '@',
            activeTab: '@',
            index: '@'
        },
        templateUrl: 'tables.html'
    };
});

angular.module('monarchApp').filter('groupFilter', ['dataFactory', function (dataFactory) {
    return function (messages, grouping, value) {
        var data = dataFactory;
        var groupingIndex = 0;
        for (i = 0; i < data.groupings.length ; i++) {
            if (grouping == data.groupings[i]) {
                groupingIndex = i;
                break;
            }
        }

        if (!data.shouldDisplayMessages[groupingIndex]) {
            return null;
        }

        var filtered, message, _i, _len;
        filtered = [];
        for (_i = 0, _len = messages.length; _i < _len; _i++) {
            message = messages[_i];
            if (message[grouping] === value) {
                filtered.push(message);
            }
        }
        return filtered;
    };
}]);

// This filter just updates limitTo ( for the specific sub-group in a tabbed grouping ) info based on already filtered data. It doesn't do any filtering
angular.module('monarchApp').filter('updateLimitInfo', ['dataFactory', function (dataFactory) {
    return function (groupNames, index, search) {
        var data = dataFactory;
        if (data.activeTab == 1 || index != data.activeTab - 2) {
            return groupNames;
        }
        var grouping = data.groupings[index];
        if (typeof search === "undefined") {
            return groupNames;
        }

        if (search == "") {
            // Reset filter info and display messages
            for (var subGroup in data[grouping]['filtered']) {
                data[grouping]['filtered'][subGroup] = false;
            }
            data.displayMessages();
            return groupNames;
        }

        // Mark everything as filtered 
        for (var subGroup in data[grouping]['filtered']) {
            data[grouping]['filtered'][subGroup] = true;
        }

        // Mark appropriate sub-groups as not filtered
        for (j = 0; j < groupNames.length; j++) {
            subGroup = groupNames[j];
            if (typeof data[grouping]['filtered'][subGroup] != "undefined") {
                data[grouping]['filtered'][subGroup] = false;
            }
        }

        data.displayMessages();
        return groupNames;
    };
}]);

angular.module('monarchApp').filter('notesFilter', function () {
    return function (messages, notes) {
        var filtered, message, _i, _len;
        filtered = [];
        for (_i = 0, _len = messages.length; _i < _len; _i++) {
            message = messages[_i];
            if (notes == null || notes[message.uniqueID] == null || notes[message.uniqueID].Status != null || notes[message.uniqueID].Status != "") {
                filtered.push(message);
            }
        }
        return filtered;
    };
});

angular.module('monarchApp').filter('orderArray', function () {
    return function (array, reverse) {
        if (!reverse) {
            return array;
        } else {
            return array.slice().reverse();
        }
    };
});

angular.module('monarchApp').filter('capitalize', function () {
    return function (value) {
        return value.charAt(0).toUpperCase() + value.substring(1);
    };
});