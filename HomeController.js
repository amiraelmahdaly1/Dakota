var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {
    $scope.Password = "";// "test11";
    $scope.Email = "";// "Lynns@ezappt.com";
    Office.initialize = function (reason) {
        var element = document.querySelector('.ms-MessageBanner');
        messageBanner = new fabric.MessageBanner(element);
        messageBanner.hideBanner();
    };
   
    $("#btnLogin").click(Login);
    function Login() {

        if (AnyEmpty($scope.Email, $scope.Password)) {
            showNotification("Notification", "Please Supply E-mail & Password.");
            return;
        }

       AngularServices.GET("ValidateUserPassword", $scope.Email, $scope.Password).then(function (data) {
            switch (data.ValidateUserPasswordResult.CodeData) {
                case -1:
                    showNotification("Notification", "There’s no staff");
                    break;
                case -2:
                    showNotification("Notification", "Incorrect Password");
                    break;
                case 0:
                    localStorage.setItem('staffID', data.ValidateUserPasswordResult.staffID);
                    localStorage.setItem('userID', data.ValidateUserPasswordResult.UserId);
                    localStorage.setItem('userName', $scope.Email);
                    Redirect("DailySchedule.html?staffID=" + data.ValidateUserPasswordResult.staffID + "&userID=" + data.ValidateUserPasswordResult.UserId + "&userName=" + $scope.Email)
                    break;
                default:
            }
        });

        //AngularServices.POST("SetAppointment",
        //    {
        //    "appointmentJson": { "DateID": 4924, "appointmentid": 185, "category": 1, "client": "Test Sagar", "clientid": 116, "dtEnd": "6/25/2018 10:00:00", "dtStart": "6/22/2018 8:00:00", "isEzapptAppointment": true, "location": "Team A", "locationid": 20010, "notes": "", "service": "Assessment", "serviceid": 20053 },
        //    "staffID": 105,
        //    "userID":122

        //}).then(function (data) {
        //    var x = "";
        //});
    }
   


   
}];

app.controller("myCtrl", myCtrl);
