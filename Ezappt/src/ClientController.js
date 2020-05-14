
var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {


    // Variables 
    $scope.lastAppointment = {};
    $scope.ClientInfo = {};
    $scope.Client = {};
    $scope.staffID = getQueryStringValue("staffID");
    $scope.userID = getQueryStringValue("userID");
    $scope.userName = getQueryStringValue("userName");
    // Event Handlers
    Office.initialize = function (reason) {
        $(document).ready(function () {
            var element = document.querySelector('.ms-MessageBanner');
            messageBanner = new fabric.MessageBanner(element);
            messageBanner.hideBanner();
            AngularServices.GET("GetAllClients").then(function (data) {
                FillAutoCompleteWidget(data.GetAllClientsResult);
            });

            $("#btnBook").click(function () {
                Redirect("Booking.html?userName=" + $scope.userName + "&staffID=" + $scope.staffID + "&userID=" + $scope.userID + "&clientName=" + $scope.Client.clientName + "&clientID=" + $scope.Client.clientID)
            });

        });
    };

    function FillAutoCompleteWidget(Clients) {
        $('#tags').autocomplete({
                source: function (request, response) {
                    var re = $.ui.autocomplete.escapeRegex(request.term);
                    var matcher = new RegExp("^" + re, "i");
                    response($.grep(($.map(Clients, function (c, i) {
                        return {
                            label: c.lastName + "," + c.firstName,
                            value: c.lastName + "," + c.firstName,
                            id: c.clientID
                        };
                    })), function (item) {
                        return matcher.test(item.label);
                    }))

            },
            select: function (event, ui) {
                $scope.Client.clientID = ui.item.id;
                $scope.Client.clientName = ui.item.label;
             $("#tags").val(ui.item.label); 
                AngularServices.GET("GetClientForm", ui.item.id).then(function (data) {

                    $scope.ClientInfo = data.GetClientFormResult;
                });
                AngularServices.GET("GetClientLastAppointmet", ui.item.id).then(function (data) {
                    $scope.lastAppointment = data.GetClientLastAppointmetResult;
                    $("#clientInfo").css("display", "block");
                    //   $scope.$applyAsync();
                });
                
                return false;
            }

            });
    }
 





}];

app.controller("myCtrl", myCtrl);


 

   
