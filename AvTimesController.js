
var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {

    //https://anoka-wcf.ezsoftco.com/WCFEzapptJsonService.svc/CreateSchedule?staffSchedJson={"StaffId": 102, "StartDate": "10/04/2018", "EndDate": "10/04/2018", "StartTime": "09:00", "EndTime": "20:00", "LocationId": 1, "SelectedDays": "2,3,4,5,6", }
    $scope.locations = [];
    var staffID = getQueryStringValue("staffID");
    var userID = getQueryStringValue("userID");
    $scope.timeArr = [];
    $scope.avTime = {
        'days': [],
        'location': '',
        'startDt': '',
        'endDt': '',
        'startTime': '',
        'endTime': '',
        'locID': ''
    }
    // Event Handlers
    Office.initialize = function (reason) {
        var element = document.querySelector('.ms-MessageBanner');
        messageBanner = new fabric.MessageBanner(element);
        messageBanner.hideBanner();
    };
    $(document).ready(function () {
        $(function () {
            $('input[name="datetimes"]').daterangepicker({
                locale: {
                    format: 'MM-DD-YYYY'
                },
                autoUpdateInput: false
            }, function (start, end) {
                $scope.avTime.startDt = start.format('MM-DD-YYYY');
                $scope.avTime.endDt = end.format('MM-DD-YYYY');
                $('#datetimes').val(start.format('MM-DD-YYYY') + "-" + end.format('MM-DD-YYYY'));
                //console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
            });
        });
        //$('#datetimes').val('');
        AngularServices.GET("GetAllStaffLocations", staffID).then(function (data) {
            $scope.locations = data.GetAllStaffLocationsResult;
        });
        $("#btnSave").click(function () {
            var timeArr = JSON.parse(JSON.stringify($scope.timeArr));
            saveAvTimes(timeArr);
        });
        $("#btnClear").click(function () {
            $scope.timeArr = [];

            $scope.$apply();
        });
        $("#btnAdd").click(function () {
            $scope.avTime.locID = Number($("#locations").find(":selected").attr("id"));
            var avTime = JSON.parse(JSON.stringify($scope.avTime));

            $scope.timeArr.push(avTime);
            $scope.$apply();
        });


    });

    $scope.removeTime = function (ind) {
        $scope.timeArr.splice(ind, 1);
    }
    $scope.toggleSelection = function toggleSelection(neb, id) {
        var idx = $scope.avTime.days.indexOf(neb);

        // Is currently selected
        if (idx > -1) {
            $scope.avTime.days.splice(idx, 1);
        }

        // Is newly selected
        else {
            $scope.avTime.days.push(neb);
        }
    };
    function saveAvTimes(timeArr) {

        var t = timeArr.pop();
        if (t == null || t == undefined) {
            showNotification("Saved Successfully.");
            Office.context.ui.messageParent(JSON.stringify($scope.timeArr));
            return;
        }

        AngularServices.POST("CreateSchedule",
            {
                "staffSchedJson": { "StaffId": staffID, "StartDate": t.startDt, "EndDate": t.endDt, "StartTime": t.startTime, "EndTime": t.endTime, "LocationId": t.locID, "SelectedDays": t.days.toString() }
            }).then(function (data) {
                saveAvTimes(timeArr);
            });

    }

}];

app.controller("myCtrl", myCtrl);





