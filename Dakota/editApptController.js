
var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {
    $scope.appt = {};
    var staffID = getQueryStringValue("staffID");
    var userID = getQueryStringValue("userID");
    $(document).ready(function () {
        $scope.appt = JSON.parse(decodeURIComponent(getQueryStringValue("appt")));
        $scope.$applyAsync();
        $("#" + $scope.appt.category).prop("checked", true);
        $("#datetimepicker1").appendDtpicker({
            "dateFormat": "M/D/YYYY h:mm",
            "current": $scope.appt.dtStart.substring(0, $scope.appt.dtStart.length - 6)
        });
        $("#select1").val($scope.appt.dtStart.slice(-2));
        $('#select1').prop('disabled', 'disabled');
        $("#datetimepicker2").appendDtpicker({
            "dateFormat": "M/D/YYYY h:mm",
            "current": $scope.appt.dtEnd.substring(0, $scope.appt.dtEnd.length - 6)
        });
        $("#select2").val($scope.appt.dtEnd.slice(-2));
        $('#select2').prop('disabled', 'disabled');

    });
    $("#reschedule").click(function () {
        $("#select1, #select2, #datetimepicker1, #datetimepicker2").removeAttr("disabled");
    });
    function setAppt(dtStart, dtEnd) {
        $scope.appt.dtStart = dtStart;
        $scope.appt.dtEnd = dtEnd;
        $scope.appt.category = $('input[name=status]:checked').attr("id");
        $scope.appt.category = $('input[name=status]:checked').attr("id");
        AngularServices.POST("UpdateAppointment",
            {
                "apJson": $scope.appt
        }).then(function (data) {
            showNotification("Saved Successfully");
        });
    }
    $("#save").click(function () {
        appt1 = $("#datetimepicker1").val() + ":00 " + $("#select1").val();
        appt2 = $("#datetimepicker2").val() + ":00 " + $("#select2").val();
        setAppt(appt1, appt2);
        $("#select1, #select2, #datetimepicker1, #datetimepicker2").attr("disabled", "disabled");
      

    });
}];

app.controller("myCtrl", myCtrl);