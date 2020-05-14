"use strict";


var app = angular.module('myApp', []);
app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);

                });
            }
        }
    }
});
//var DeploymentHost = "https://amiraelmahdaly1.github.io/Ezappt/";
var DeploymentHost = "https://dakota-addin.ezappt.net/";
//var DeploymentHost = "https://localhost:44391/";
var messageBanner;
var BaseURI = "https://dakota-wcf.ezappt.net/WCFEzapptJsonService.svc/";
// Error Handling Region

function hideErrorMessage() {

    setTimeout(function () {
        messageBanner.hideBanner();
    }, 2000);
}
// Helper function for treating errors
function errorHandler(error) {
    showNotification("Error", error.responseText);
}
// Helper function for displaying notifications
function showNotification(header, content) {
    $("#notificationHeader").text(header);
    $("#notificationBody").text(content);
    messageBanner.showBanner();
    messageBanner.toggleExpansion();
    hideErrorMessage();
}
function FormatParams(params) {
    var par = "";
    for (var i = 1; i < params.length; i++) {
        if (i != params.length - 1)
            par += params[i] + "/";
        else
            par += params[i];

    }
    return par;
}
function AnyEmpty() {
    for (var i = 0; i < arguments.length; i++)
        if (arguments[i].trim() == "") return true;
    return false;
}
function Redirect(q) {
    window.location.href = q;
}
function getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}
Storage.prototype.setObj = function (key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function (key) {
    return JSON.parse(this.getItem(key))
}

app.service('AngularServices', ['$http', function ($http) {
    
    var API = {
        GET: function (EndPoint) {
            var URI;
            if (arguments.length == 1)
                URI = BaseURI + EndPoint;
            else
                URI = BaseURI + EndPoint + "/" + FormatParams(arguments);
            return $http(
                {
                    method: 'GET',
                    url: URI,
                    headers: {
                        //'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
                .then(function (response) {
                    return response.data;
                }).catch(errorHandler);
        }
        ,
        POST: function (EndPoint, Params) {
            return $http({
                method: 'POST',
                url: BaseURI + EndPoint,
                params: Params
            })
                .then(function (response) {
                    return response.data;
                }).catch(errorHandler);
        },

        POSTDATA: function (EndPoint, headers,data) {
            return $http({
                method: 'POST',
                url:  EndPoint,
                data: data,
                headers: headers
            })
                .then(function (response) {
                    return response;
                }).catch(errorHandler);
        }
    


    };

    return API;
 }]);



