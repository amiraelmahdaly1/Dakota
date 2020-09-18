
var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {

    //https://anoka-wcf.ezsoftco.com/WCFEzapptJsonService.svc/CreateSchedule?staffSchedJson={"StaffId": 102, "StartDate": "10/04/2018", "EndDate": "10/04/2018", "StartTime": "09:00", "EndTime": "20:00", "LocationId": 1, "SelectedDays": "2,3,4,5,6", }
    $scope.locations = [];
    var staffID = getQueryStringValue("staffID");
    var userID = getQueryStringValue("userID");
    $scope.timeArr = [];
    $scope.avTime = {
        'startDt': '',
        'endDt': '',
        'startTime': '',
        'endTime': '',
        'location':''
        }
    // Event Handlers
    Office.initialize = function (reason) {
            var element = document.querySelector('.ms-MessageBanner');
            messageBanner = new fabric.MessageBanner(element);
            messageBanner.hideBanner();
    };
    $(document).ready(function () {
        $(function () {
            $("#datepicker1").datepicker({
                defaultDate: "0d",
                dateFormat: "mm-dd-yy",
                onSelect: function (date) {
                    $scope.avTime.startDt = date;
                    $scope.avTime.endDt = date;
                }
            });

        });
        AngularServices.GET("GetAllStaffLocations", staffID).then(function (data) {
            $scope.locations = data.GetAllStaffLocationsResult;
        });
        $("#btnSave").click(function () {
            $scope.avTime.locID = Number($("#locations").find(":selected").attr("id"));
            var avTime = JSON.parse(JSON.stringify($scope.avTime));
            $scope.timeArr.push(avTime);
            Office.context.ui.messageParent(JSON.stringify($scope.timeArr));
        });
       
    });

   

}];

app.controller("myCtrl", myCtrl);





