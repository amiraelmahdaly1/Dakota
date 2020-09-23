
var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {


    // Variables 
    var CalendarID = sessionStorage.getItem('calendarID');
    $scope.lastAppointment = {};
    $scope.ClientInfo = {};
    $scope.staffID = getQueryStringValue("staffID");
    $scope.userID = getQueryStringValue("userID");
    $scope.clientName = getQueryStringValue("clientName");
    $scope.clientID = getQueryStringValue("clientID");
    $scope.userName = getQueryStringValue("userName");
    $scope.services = [];
    $scope.locations = [];
    $scope.currentDate = "";
    $scope.serviceName = '';
    $scope.serviceTime = '';
    $scope.dateID = '';
    $scope.time = "";
    $scope.notes = "";
    var categories = {
        '1': 'Active',
        '2': 'No show',
        '3': 'Cancelled',
        '4': 'Completed',
        '5': 'Arrived',
        '6': 'In progress',
        '7': 'Fraud'
    };
    // Event Handlers

    Office.initialize = function (reason) {
        $(document).ready(function () {
            var element = document.querySelector('.ms-MessageBanner');
            messageBanner = new fabric.MessageBanner(element);
            messageBanner.hideBanner();
            loadRestDetails();
            $("#tags").val($scope.clientName);
            AngularServices.GET("GetAllClients").then(function (data) {
                FillAutoCompleteWidget(data.GetAllClientsResult);


            });
            AngularServices.GET("GetSatffServices", $scope.staffID).then(function (data) {
                $scope.services = data.GetSatffServicesResult;
            });
            AngularServices.GET("GetAllStaffLocations", $scope.staffID).then(function (data) {
                $scope.locations = data.GetAllStaffLocationsResult;
            });
            $('#datepick').datepicker({
                inline: true,
                dateFormat: "mm-dd-yy",
                onSelect: function (date) {
                    $("#btnSearch").click();
                }
            });
            $("#btnSearch").click(function () {
                $scope.currentDate = $('#datepick').val();
                $scope.serviceName = $("#services").find(":selected").val();
                $scope.serviceTime = $scope.services[$("#services").find(":selected").index()].serviceTime;
                $scope.serviceID = $("#services").find(":selected").attr("id");
                $scope.locationID = $("#locations").find(":selected").attr("id");
                //if ($scope.locationID == undefined)
                //    $scope.locationID = 20010;
                AngularServices.GET("GetAvailableHoursByDate", $scope.currentDate, $scope.staffID, $scope.locationID).then(function (data) {
                    $scope.dateID = data.GetAvailableHoursByDateResult.Date_ID;
                });
                AngularServices.GET("GetAvailableHoursByDate1", $scope.currentDate, $scope.staffID, $scope.locationID, $scope.serviceID).then(function (data) {
                    $scope.times = data.GetAvailableHoursByDate1Result;
                    if ($scope.times.length == 0)
                        showNotification("No times available");
                    $("#date").removeAttr("style");
                });
            });
            $("#btnCancel").click(function () {
                $("#confirm").css("display", "none");
                $("#date").removeAttr("style");
            });

            $("#btnConfirm").click(function () {
                var minsToAdd = Number($scope.serviceTime);
                var endTime = new Date(new Date("1970/01/01 " + $scope.time).getTime() + minsToAdd * 60000).toLocaleTimeString('en-UK', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
                $scope.appt = { "DateID": $scope.dateID, "appointmentid": 0, "category": 1, "client": $scope.clientName, "clientid": $scope.clientID, "dtEnd": $scope.currentDate + " " + endTime, "dtStart": $scope.currentDate + " " + $scope.time, "isEzapptAppointment": true, "location": "", "locationid": $scope.locationID, "notes": $scope.notes, "service": "", "serviceid": $scope.serviceID }
                AngularServices.POST("SetAppointment",
                    {
                        "appointmentJson": $scope.appt,
                        "staffID": $scope.staffID,
                        "userID": $scope.userID

                    }).then(function (data) {
                        checkForEzappt();
                        $("#confirm").css("display", "none");
                        $("#date").css("display", "none");
                        showNotification("Notification", "Booked Successfully");
                        $scope.notes = "";
                        window.location.replace("DailySchedule.html?userName="+$scope.userName+"&staffID="+$scope.staffID+"&userID="+$scope.userID)
                    });

            });
        });
    };


    $scope.apptDetails = function () {
        $scope.time = this.time;
        $("#date").css("display", "none");
        $("#confirm").removeAttr("style");
    }
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
                $("#tags").val(ui.item.label);
                $scope.clientName = ui.item.label;
                $scope.clientID = ui.item.id;
                return false;
            }

        });
    }

    function loadRestDetails() {
        if (Office.context.mailbox.diagnostics.hostName !== 'OutlookIOS') {
            restId = Office.context.mailbox.convertToRestId(
                Office.context.mailbox.item.itemId,
                Office.MailboxEnums.RestVersion.Beta
            );
        } else {
            restId = Office.context.mailbox.item.itemId;
        }
        restUrl = Office.context.mailbox.restUrl + '/v2.0/me/';
        Office.context.mailbox.getCallbackTokenAsync({ isRest: true }, function (result) {
            if (result.status === "succeeded") {
                rawToken = result.value;
                //checkForEzappt();
                $scope.restDetailsLoaded = true;

            } else {
                rawToken = 'error';
            }
        });
    }
    function CalendarExists(Calendars) {
        for (var i = 0; i < Calendars.length; i++) {
            if (Calendars[i].Name.trim() === "EzapptNew") {
                CalendarID = Calendars[i].Id;
                sessionStorage.setItem('calendarID', CalendarID);
                return true;
            }
        }
        return false;

    }
    function checkForEzappt() {
        if (CalendarID) {
            var start = $scope.appt.dtStart;
            var end = $scope.appt.dtEnd;
            getAndDeleteEvents(new Date(new Date(new Date(start)).setMinutes(new Date(start).getMinutes() + 5)).toISOString(), new Date(new Date(new Date(end)).setMinutes(new Date(end).getMinutes() - 5)).toISOString());

        }
        else
            $.ajax({
                url: restUrl + 'calendars',
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + rawToken,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            }).done(function (item) {
                if (CalendarExists(item.value)) {
                    var start = $scope.appt.dtStart;
                    var end = $scope.appt.dtEnd;
                    getAndDeleteEvents(new Date(new Date(new Date(start)).setMinutes(new Date(start).getMinutes() + 5)).toISOString(), new Date(new Date(new Date(end)).setMinutes(new Date(end).getMinutes() - 5)).toISOString());
                }
                else {
                    //no calendar
                    CreateEzapptCalendar();
                }
            }).fail(errorHandler);

    }
    function CreateEzapptCalendar() {
        $.ajax({
            url: restUrl + 'calendars',
            method: "POST",
            data: '{ "Name": "EzapptNew" }',
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + rawToken
            }
        }).done(function (item) {
            CalendarID = item.Id;
            sessionStorage.setItem('calendarID', CalendarID);
            CreateEvent();

        }).fail(errorHandler);

    }
    function getAndDeleteEvents(dtStart, dtEnd) {
        $.ajax({
            url: restUrl + 'calendars/' + CalendarID + '/calendarview?startDateTime=' + dtStart + '&endDateTime=' + dtEnd + '&$select=id',
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + rawToken,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        }).done(function (item) {

            if (item.value.length === 0)
                CreateEvent();
            else
                DeleteEvents(item.value);
        }).fail(errorHandler);
    }
    function DeleteEvents(events) {

        if (events.length == 0) {

            CreateEvent(n);
        }
        else {
            $.ajax({
                url: restUrl + 'events/' + (events.pop()).Id,
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + rawToken
                }
            }).done(function (item) {
                DeleteEvents(events, n);
            }).fail(errorHandler);
        }
    }
    function CreateEvent() {
        AngularServices.GET("GetClientForm", $scope.appt.clientid).then(function (data) {
            var htmlBody = '<p>Client: ' + data.GetClientFormResult.first + ' ' + data.GetClientFormResult.last + '</p><p>Address1: ' + data.GetClientFormResult.address + '</p><p>Address2: ' + data.GetClientFormResult.city + ' ' + data.GetClientFormResult.state + ' ' + data.GetClientFormResult.zip + '</p><p></p><p>Service: ' + $scope.appt.service + "</p><p>Caregory: " + categories[$scope.appt.category] + "</p><p>Notes: " + $scope.appt.notes + "</p>";
            var apptSynced = '{"Subject": "' + $scope.appt.client + '", "Categories": ["Purple category"],"Body": {"ContentType": "HTML","Content": "' + htmlBody + '"},"Start": {"DateTime": "' + new Date($scope.appt.dtStart).toISOString() + '","TimeZone": "Pacific Standard Time"},"End": {"DateTime": "' + new Date($scope.appt.dtEnd).toISOString() + '","TimeZone": "Pacific Standard Time"},"Attendees": []}';
            $.ajax({
                //'url': restUrl + '/events',
                'url': restUrl + 'calendars/' + CalendarID + '/events',
                'type': "POST",
                'data': apptSynced,
                'headers': {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + rawToken
                }
            }).done(function (item) {
                showNotification("syncing appointment done");
            }).fail(errorHandler);
        });




    }




}];

app.controller("myCtrl", myCtrl);





