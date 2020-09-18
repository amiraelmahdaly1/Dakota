
var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {

    $scope.allAppts = [];
    var restUrl = '';
    var rawToken = getQueryStringValue("token");
    var CalendarID = getQueryStringValue("calendarID");
    // Event Handlers

    Office.initialize = function (reason) {
        $(document).ready(function () {

            var element = document.querySelector('.ms-MessageBanner');
            messageBanner = new fabric.MessageBanner(element);
            messageBanner.hideBanner();
            restUrl = Office.context.mailbox.restUrl + '/v2.0/me/';
            getAppts();

        });
    };

    $scope.cancelAppt = function (index) {
        $scope.index = index;
        AngularServices.POST("CancelAppointment",
            {
                "id": getApptId(index),
                "categoryJson": "1",
                "notes": ""
            }).then(function (data) {
                cancelOutlookAppt($scope.appts[index].Id);
            });
    }
    function getApptId(i) {
        var bodyHtml = $scope.appts[i].Body.Content;
        var res = bodyHtml.match(/ezapptApptID_\d+/g);
        return res[0].replace("ezapptApptID_", "");
    }
    function getAppts() {
        $.ajax({
            url: restUrl + 'calendars/' + CalendarID + '/events?$filter=Subject%20ne%20%27%27',
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + rawToken,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        }).done(function (item) {
            console.log(item);
            $scope.appts = item.value.filter(function (value) { return value.Subject != '' })
            console.log(item);
            $scope.$apply();

        }).fail(errorHandler);
    }
    function cancelOutlookAppt(id){
        $.ajax({
            url: restUrl + 'events/' + id,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + rawToken,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        }).done(function (item) {
            console.log(item);
            $scope.appts.splice($scope.index, 1);
            $scope.$apply();
        }).fail(errorHandler);
    }

}];

app.controller("myCtrl", myCtrl);





