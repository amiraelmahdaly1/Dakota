
var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {

    var rawToken = "";
    var restId = '';
    var restUrl = '';
    $scope.staffID = getQueryStringValue("staffID");
    $scope.userID = getQueryStringValue("userID");
    $scope.userName = getQueryStringValue("userName");
    var grouped = [];
    var categories = {
        '1': 'Active',
        '2': 'No show',
        '3': 'Cancelled',
        '4': 'Completed',
        '5': 'Arrived',
        '6': 'In progress',
        '7': 'Fraud'
    };
    $scope.allAppts = [];
    $scope.restDetailsLoaded = false;
    $scope.allSyncAppts = [];
    $scope.allSyncAvs = [];
    var arrSyncIds = [];
    $scope.pickedDateAppts = [];
    var editApptDialog;
    var editApptDialogUrl = DeploymentHost + "editAppt.html?staffID=" + $scope.staffID + "&userID=" + $scope.userID;
    var editAvTimesDialog;
    var editAvTimesDialogUrl = DeploymentHost + "AvTimes.html?staffID=" + $scope.staffID + "&userID=" + $scope.userID;
    var blockTimesDialog;
    var blockTimesDialogUrl = DeploymentHost + "BlockTimes.html?staffID=" + $scope.staffID + "&userID=" + $scope.userID;

    var editApptDialogUrlStringified = "";
    var CalendarID;
    $scope.avTimes = [];
    $scope.ezapptEvents = [];
    Office.initialize = function (reason) {
        $(document).ready(function () {
            var element = document.querySelector('.ms-MessageBanner');
            messageBanner = new fabric.MessageBanner(element);
            messageBanner.hideBanner();
            getAllAppts();
            loadRestDetails();
            // Hook Controls with events and configure controls.
            $("#btnLogout").click(function () {
                localStorage.removeItem('staffID');
                localStorage.removeItem('userID');
                localStorage.removeItem('userName');
                Redirect("Home.html");
            });
            $("#btnAddAvTimes").click(ShowAvTimesDialog);
            $("#btncancelAppt").click(cancelApptOpenner);
            $("#btnBlockTimes").click(ShowBlockTimesDialog);
            $("#btnSync").click(getSyncItems);
            $("#datepicker1").datepicker({
                defaultDate: "0d",
                dateFormat: "m/d/yy",
                onSelect: function () {
                    getAllAppts();
                }
            });
            $("#datepicker1").datepicker("setDate", "0d");
            setTimeout(function () { getSyncItems(); }, 180000);
        });
    };

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
                getSyncItems();
            } else {
                rawToken = 'error';
                loadRestDetails();
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
    function ShowAvTimesDialog() {
        Office.context.ui.displayDialogAsync(editAvTimesDialogUrl, { height: 70, width: 60, displayInIframe: true },
            function (asyncResult) {
                editAvTimesDialog = asyncResult.value;
                editAvTimesDialog.addEventHandler(Office.EventType.DialogMessageReceived, editAvTimesDialogMessageReceived);
            }
        );
    }
    function ShowBlockTimesDialog() {
        Office.context.ui.displayDialogAsync(blockTimesDialogUrl, { height: 70, width: 60, displayInIframe: true },
            function (asyncResult) {
                blockTimesDialog = asyncResult.value;
                blockTimesDialog.addEventHandler(Office.EventType.DialogMessageReceived, BlockTimesDialogMessageReceived);
            }
        );
    }
    function editAvTimesDialogMessageReceived(arg) {
        $scope.avTimes = JSON.parse(arg.message);
        editAvTimesDialog.close();
        //showNotification("Please wait until ezappt calendar is created.");
        if ($scope.avTimes.length != 0) {
            $scope.key = 'avTimes';
            $scope.ezapptEvents = [];
            checkForEzappt();
        }

    }
    function BlockTimesDialogMessageReceived(arg) {
        $scope.avTimes = JSON.parse(arg.message);
        blockTimesDialog.close();
        //showNotification("Please wait until ezappt calendar is created.");
        if ($scope.avTimes.length != 0) {
            $scope.key = 'blockTimes';
            $scope.ezapptEvents = [];
            checkForEzappt();
        }

    }
    function checkForEzappt() {
        if (sessionStorage.getItem('calendarID')) {
            $scope.newlyCreated = false;
            if ($scope.key === 'avTimes' || $scope.key === 'blockTimes') {
                for (i = 0; i < $scope.avTimes.length; i++) {
                    var events = getEvents(new Date($scope.avTimes[i].startDt), new Date($scope.avTimes[i].endDt), Number($scope.avTimes[i].startTime.replace(':30', '.5').replace(':00', '')), Number($scope.avTimes[i].endTime.replace(':30', '.5').replace(':00', '')), $scope.avTimes[i].days);
                    $scope.ezapptEvents = $scope.ezapptEvents.concat(events);

                }
                var k = 0;
                if ($scope.ezapptEvents.length != 0)
                    getAndDeleteEvents(new Date(new Date(new Date(JSON.parse($scope.ezapptEvents[k]).Start.DateTime)).setMinutes(new Date(JSON.parse($scope.ezapptEvents[k]).Start.DateTime).getMinutes() + 5)).toISOString(), new Date(new Date(new Date(JSON.parse($scope.ezapptEvents[k]).End.DateTime)).setMinutes(new Date(JSON.parse($scope.ezapptEvents[k]).End.DateTime).getMinutes() - 5)).toISOString(), k);
            }
            else {
                //appt after creating ezappt cal
                var k = 0;
                //new Date(new Date(dt).setMinutes(dt.getMinutes() + 30)).toISOString()
                getAndDeleteEvents(new Date(new Date(new Date($scope.allSyncAppts[k].dtStart)).setMinutes(new Date($scope.allSyncAppts[k].dtStart).getMinutes() + 30)).toISOString(), new Date($scope.allSyncAppts[k].dtEnd).toISOString(), k);

            }
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
                    $scope.newlyCreated = false;
                    if ($scope.key === 'avTimes' || $scope.key === 'blockTimes') {
                        for (i = 0; i < $scope.avTimes.length; i++) {
                            var events = getEvents(new Date($scope.avTimes[i].startDt), new Date($scope.avTimes[i].endDt), Number($scope.avTimes[i].startTime.replace(':30', '.5').replace(':00', '')), Number($scope.avTimes[i].endTime.replace(':30', '.5').replace(':00', '')), $scope.avTimes[i].days)
                            $scope.ezapptEvents = $scope.ezapptEvents.concat(events);

                        }
                        var k = 0;
                        if ($scope.ezapptEvents.length != 0)
                            getAndDeleteEvents(new Date(new Date(new Date(JSON.parse($scope.ezapptEvents[k]).Start.DateTime)).setMinutes(new Date(JSON.parse($scope.ezapptEvents[k]).Start.DateTime).getMinutes() + 5)).toISOString(), new Date(new Date(new Date(JSON.parse($scope.ezapptEvents[k]).End.DateTime)).setMinutes(new Date(JSON.parse($scope.ezapptEvents[k]).End.DateTime).getMinutes() - 5)).toISOString(), k);

                        //CreateEvent(k);
                    }
                    else {
                        //appt after creating ezappt cal
                        var k = 0;
                        //new Date(new Date(dt).setMinutes(dt.getMinutes() + 30)).toISOString()
                        getAndDeleteEvents(new Date(new Date(new Date($scope.allSyncAppts[k].dtStart)).setMinutes(new Date($scope.allSyncAppts[k].dtStart).getMinutes() + 30)).toISOString(), new Date($scope.allSyncAppts[k].dtEnd).toISOString(), k);

                    }
                }
                else {
                    //no calendar
                    $scope.newlyCreated = true;
                    CreateEzapptCalendar();
                }
            }).fail(errorHandler);

    }
    function cancelApptOpenner(){
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
                Redirect("CancelAppt.html?token=" + rawToken + "&calendarID=" + CalendarID);           
            }
            else {
                //no calendar
                showNotification("no created Ezappt calendar yet!")
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
            $scope.ezapptEvents = [];

            if ($scope.key === 'avTimes' || $scope.key === 'blockTimes') {
                for (i = 0; i < $scope.avTimes.length; i++) {
                    var events = getEvents(new Date($scope.avTimes[i].startDt), new Date($scope.avTimes[i].endDt), Number($scope.avTimes[i].startTime.replace(':30', '.5').replace(':00', '')), Number($scope.avTimes[i].endTime.replace(':30', '.5').replace(':00', '')), $scope.avTimes[i].days)
                    $scope.ezapptEvents = $scope.ezapptEvents.concat(events);

                }
                var k = 0;
                if ($scope.ezapptEvents.length != 0)
                    CreateEvent(k);
            }
            else {
                var k = 0;

                CreateEvent(k);
                //appt after creating ezappt cal
            }


        }).fail(errorHandler);

    }
    function getAndDeleteEvents(dtStart, dtEnd, i) {
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

            if ($scope.key === 'appt') {
                DeleteEvents(item.value, i);
            }
            else {

                if (item.value.length === 0)
                    CreateEvent(i);
                else {
                    i++;
                    if (i < $scope.ezapptEvents.length)
                        getAndDeleteEvents(new Date(new Date(new Date(JSON.parse($scope.ezapptEvents[i]).Start.DateTime)).setMinutes(new Date(JSON.parse($scope.ezapptEvents[i]).Start.DateTime).getMinutes() + 5)).toISOString(), new Date(new Date(new Date(JSON.parse($scope.ezapptEvents[i]).End.DateTime)).setMinutes(new Date(JSON.parse($scope.ezapptEvents[i]).End.DateTime).getMinutes() - 5)).toISOString(), i);
                    else {
                        if ($scope.key === "avTimes")
                            showNotification("outlook Available times sync completed.");
                        else
                            blockEzapptTimes()
                    }
                }

            }
        }).fail(errorHandler);
    }
    function DeleteEvents(events, n) {

        if (events.length == 0) {
            //showNotification("All events are now deleted");
            //create event here
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
    function CreateEvent(k) {
        var apptSynced;
        if ($scope.key === 'avTimes' || $scope.key === 'blockTimes') {
            apptSynced = $scope.ezapptEvents[k];
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

                if ($scope.newlyCreated) {

                    if ($scope.key === 'appt') {
                        arrSyncIds.push($scope.allSyncAppts[k].appointmentid);
                        k++;
                        if (k < $scope.allSyncAppts.length)
                            CreateEvent(k);
                        else
                            showNotification("syncing appointments done");
                    }
                    else {
                        DismissReminders(item.Id, k);
                    }
                }
                else
                    if ($scope.key === 'appt') {
                        arrSyncIds.push($scope.allSyncAppts[k].appointmentid);
                        k++;
                        if (k < $scope.allSyncAppts.length)
                            getAndDeleteEvents(new Date(new Date(new Date($scope.allSyncAppts[k].dtStart)).setMinutes(new Date($scope.allSyncAppts[k].dtStart).getMinutes() + 30)).toISOString(), new Date($scope.allSyncAppts[k].dtEnd).toISOString(), k);
                        else
                            AngularServices.POST("RemoveApptSyncItemsFromDb", { "apptIdsJson": JSON.stringify(arrSyncIds) }).then(function (data) {

                                showNotification("outlook Appointments sync completed.");
                            });
                    }
                    else {
                        DismissReminders(item.Id, k);

                    }


            }).fail(errorHandler);
        }

        else {
            AngularServices.GET("GetClientForm", $scope.allSyncAppts[k].clientid).then(function (data) {
                var htmlBody = "<div id='ezapptApptID_" + $scope.allSyncAppts[k].appointmentid  +"'><p>Client: " + data.GetClientFormResult.first + ' ' + data.GetClientFormResult.last + '</p><p>Address1: ' + data.GetClientFormResult.address + '</p><p>Address2: ' + data.GetClientFormResult.city + ' ' + data.GetClientFormResult.state + ' ' + data.GetClientFormResult.zip + '</p><p></p><p>Service: ' + $scope.allSyncAppts[k].service + "</p><p>Caregory: " + categories[$scope.allSyncAppts[k].category] + "</p><p>Notes: " + $scope.allSyncAppts[k].notes + "</p></div>";
                apptSynced = '{"Subject": "' + $scope.allSyncAppts[k].client + '", "Categories": ["Purple category"],"Body": {"ContentType": "HTML","Content": "' + htmlBody + '"},"Start": {"DateTime": "' + new Date($scope.allSyncAppts[k].dtStart).toISOString() + '","TimeZone": "Pacific Standard Time"},"End": {"DateTime": "' + new Date($scope.allSyncAppts[k].dtEnd).toISOString() + '","TimeZone": "Pacific Standard Time"},"Attendees": []}';
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

                    if ($scope.newlyCreated) {

                        if ($scope.key === 'appt') {
                            arrSyncIds.push($scope.allSyncAppts[k].appointmentid);
                            k++;
                            if (k < $scope.allSyncAppts.length)
                                CreateEvent(k);
                            else
                                showNotification("syncing appointments done");
                        }
                        else {
                            DismissReminders(item.Id, k);
                        }
                    }
                    else
                        if ($scope.key === 'appt') {
                            arrSyncIds.push($scope.allSyncAppts[k].appointmentid);
                            k++;
                            if (k < $scope.allSyncAppts.length)
                                getAndDeleteEvents(new Date(new Date(new Date($scope.allSyncAppts[k].dtStart)).setMinutes(new Date($scope.allSyncAppts[k].dtStart).getMinutes() + 30)).toISOString(), new Date($scope.allSyncAppts[k].dtEnd).toISOString(), k);
                            else
                                AngularServices.POST("RemoveApptSyncItemsFromDb", { "apptIdsJson": JSON.stringify(arrSyncIds) }).then(function (data) {

                                    showNotification("outlook Appointments sync completed.");
                                });
                        }
                        else {
                            DismissReminders(item.Id, k);

                        }


                }).fail(errorHandler);
            });
        }



    }
    function DismissReminders(id, n) {

        $.ajax({
            url: restUrl + 'events/' + id + '/DismissReminder',
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + rawToken
            }
        }).done(function (item) {
            if ($scope.newlyCreated) {
                n++;
                if (n < $scope.ezapptEvents.length) {
                    CreateEvent(n);
                }
                else {
                    if ($scope.key === "avTimes")
                        showNotification("outlook Available times sync completed.");
                    else
                        blockEzapptTimes()
                }
            }
            else {
                n++;
                if (n < $scope.ezapptEvents.length)
                    getAndDeleteEvents(new Date(new Date(new Date(JSON.parse($scope.ezapptEvents[n]).Start.DateTime)).setMinutes(new Date(JSON.parse($scope.ezapptEvents[n]).Start.DateTime).getMinutes() + 5)).toISOString(), new Date(new Date(new Date(JSON.parse($scope.ezapptEvents[n]).End.DateTime)).setMinutes(new Date(JSON.parse($scope.ezapptEvents[n]).End.DateTime).getMinutes() - 5)).toISOString(), n);
                else {
                    if ($scope.key === "avTimes")
                        showNotification("outlook Available times sync completed.");
                    else
                        blockEzapptTimes()
                }
            }
           
        }).fail(errorHandler);

    }
    function blockEzapptTimes() {
        AngularServices.GET("GetAvailableHoursByDate", $scope.avTimes[0].startDt, $scope.staffID, $scope.avTimes[0].locID).then(function (data) {
            $scope.dateID = data.GetAvailableHoursByDateResult.Date_ID;
            $scope.appt = { "DateID": $scope.dateID, "appointmentid": 0, "category": 1, "client": "", "clientid": 0, "dtEnd": $scope.avTimes[0].endDt + " " + $scope.avTimes[0].endTime, "dtStart": $scope.avTimes[0].startDt + " " + $scope.avTimes[0].startTime, "isEzapptAppointment": true, "location": "", "locationid": $scope.avTimes[0].locID, "notes": "", "service": "", "serviceid": 0 };
            AngularServices.POST("SetAppointment",
                {
                    "appointmentJson": $scope.appt,
                    "staffID": $scope.staffID,
                    "userID": $scope.userID

                }).then(function (data) {
                    showNotification("Blocking times completed.");
                });
        });

    }
    function getSyncItems() {
        AngularServices.GET("GetSyncItems", $scope.staffID).then(function (data) {
            $scope.allSyncAppts = data.GetSyncItemsResult;
            if ($scope.allSyncAppts.length > 0) {
                $scope.key = 'appt';
                checkForEzappt();

            }
            else
                showNotification("No Appointments to sync");
        });
    }
    function ShowEditApptDialog() {
        Office.context.ui.displayDialogAsync(editApptDialogUrlStringified, { height: 70, width: 60, displayInIframe: true },
            function (asyncResult) {
                editApptDialog = asyncResult.value;
                editApptDialog.addEventHandler(Office.EventType.DialogEventReceived, editApptDialogClosed);
            }
        );
    }
    function editApptDialogClosed(arg) {
        getAllAppts();
    }
    function getAllAppts() {
        AngularServices.GET("GetAppointments", $scope.staffID).then(function (data) {
            $scope.allAppts = data.GetAppointmentsResult;
            getPickedAppts($("#datepicker1").val());
            $scope.$applyAsync();
        });
    }
    function getPickedAppts(date) {
        $scope.pickedDateAppts = $scope.allAppts.filter(function (value) { return value.dtStart.indexOf(date) >= 0 })
    }
    // Returns an array of dates between the two dates
    function getEvents(startDate, endDate, startTime, endTime, days) {
        Number.isInteger = Number.isInteger || function (value) {
            return typeof value === "number" &&
                isFinite(value) &&
                Math.floor(value) === value;
        };
        var Dates;
        if (days)
            Dates = getDates(startDate, endDate, days);
        else
            Dates = [startDate];
        var Events = [];
        var dt;

        for (var i = 0; i < Dates.length; i++) {
            dt = new Date(Dates[i].toString());
            dt.setHours(dt.getHours() + startTime);
            var event;
            if (!Number.isInteger(startTime))
                dt.setMinutes(dt.getMinutes() + 30);
            for (var j = 0; j < (endTime - startTime) * 2; j++) {
                if ($scope.key === "avTimes")
                    event = '{"Subject": "", "Categories": ["Free"],"Body": {"ContentType": "HTML","Content": ""},"Start": {"DateTime": "' + new Date(dt).toISOString() + '","TimeZone": "Pacific Standard Time"},"End": {"DateTime": "' + new Date(new Date(dt).setMinutes(dt.getMinutes() + 30)).toISOString() + '","TimeZone": "Pacific Standard Time"},"Attendees": []}';
                else 
                    event = '{"Subject": "", "Categories": ["Red category"],"Body": {"ContentType": "HTML","Content": ""},"Start": {"DateTime": "' + new Date(dt).toISOString() + '","TimeZone": "Pacific Standard Time"},"End": {"DateTime": "' + new Date(new Date(dt).setMinutes(dt.getMinutes() + 30)).toISOString() + '","TimeZone": "Pacific Standard Time"},"Attendees": []}';
                Events.push(event);
                dt.setMinutes(dt.getMinutes() + 30);
            }

        }
        return Events;
    }
    function getDates(startDate, endDate, days) {
        var dates = [],
            currentDate = startDate,
            addDays = function (days) {
                var date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            };
        while (currentDate <= endDate) {
            if (dayIsIncluded(currentDate, days))
                dates.push(currentDate);
            currentDate = addDays.call(currentDate, 1);
        }
        return dates;
    }
    function dayIsIncluded(currentDate, days) {
        var day = currentDate.getDay();
        for (var i = 0; i < days.length; i++) {
            if (day === days[i])
                return true;
        }
        return false;
    }
    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $(".clickable-row").click(function () {
            var appointmentID = Number($(this).attr("id"));
            var appt = $scope.allAppts.filter(function (obj) {
                return obj.appointmentid == appointmentID;
            });
            editApptDialogUrlStringified = editApptDialogUrl + "&appt=" + encodeURIComponent(JSON.stringify(appt[0]));
            ShowEditApptDialog();

        });
    });

}];

app.controller("myCtrl", myCtrl);