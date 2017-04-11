
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

var AuthenticationContext;

var authority = 'https://login.windows.net/keckmedicine.onmicrosoft.com';
var resourceUrl = 'https://graph.windows.net/';
var appId = '2b12cfe7-b4d8-4256-9072-ca27dade4e55';
var redirectUrl = 'http://localhost:4400/services/aad/redirectTarget.html';
  
var tenantName = 'keckmedicine.onmicrosoft.com';
var endpointUrl = resourceUrl + tenantName;

function pre(json) {
    return '<pre>' + JSON.stringify(json, null, 4) + '</pre>';
}

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', app.onDeviceReady, false);

        document.getElementById('create-context').addEventListener('click', app.createContext);
        //document.getElementById('acquire-token').addEventListener('click', app.acquireToken);
        document.getElementById('loginbutton').addEventListener('click', app.acquireToken);
        document.getElementById('acquire-token-silent').addEventListener('click', app.acquireTokenSilent);
        document.getElementById('read-tokencache').addEventListener('click', app.readTokenCache);
        document.getElementById('clear-tokencache').addEventListener('click', app.clearTokenCache);

        function toggleMenu() {
            // menu must be always shown on desktop/tablet
            //alert("toggleMenu");
            if (document.body.clientWidth > 480) return;
            var cl = document.body.classList;
            if (cl.contains('left-nav')) { cl.remove('left-nav'); }
            else { cl.add('left-nav'); }
        }

        document.getElementById('slide-menu-button').addEventListener('click', toggleMenu);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        // app.receivedEvent('deviceready');
        app.logArea = document.getElementById("log-area");
        app.log("Cordova initialized, 'deviceready' event was fired");
        AuthenticationContext = Microsoft.ADAL.AuthenticationContext;
        app.createContext();
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    log: function (message, isError) {
        isError ? console.error(message) : console.log(message);
        var logItem = document.createElement('li');
        logItem.classList.add("topcoat-list__item");
        isError && logItem.classList.add("error-item");
        var timestamp = '<span class="timestamp">' + new Date().toLocaleTimeString() + ': </span>';
        logItem.innerHTML = (timestamp + message);
        app.logArea.insertBefore(logItem, app.logArea.firstChild);
    },
    error: function (message) {
        app.log(message, true);
    },
    createContext: function() {
        AuthenticationContext.createAsync(authority)
        .then(function (context) {
            app.authContext = context;
            app.log("Created authentication context for authority URL: " + context.authority);
        }, app.error);
    },
    acquireToken: function () {
        if (app.authContext == null) {
            app.error('Authentication context isn\'t created yet. Create context first');
            return;
        }      

        app.authContext.acquireTokenAsync(resourceUrl, appId, redirectUrl)
            .then(function(authResult) {
                app.log('XAcquired token successfully: ' + pre(authResult));
                window.location = 'search.html?id=' + authResult.userInfo.uniqueId;
            }, function(err) {
                app.error("Failed to acquire token: " + pre(err));
            });
    },
    acquireTokenSilent: function() {
        if (app.authContext == null) {
            app.error('Authentication context isn\'t created yet. Create context first');
            return;
        }

        // testUserId parameter is needed if you have > 1 token cache items to avoid "multiple_matching_tokens_detected" error
        // Note: This is for the test purposes only
        var testUserId;
        app.authContext.tokenCache.readItems().then(function (cacheItems) {
            if (cacheItems.length > 0) {
                testUserId = cacheItems[0].userInfo.userId;
            }

            app.authContext.acquireTokenSilentAsync(resourceUrl, appId, testUserId).then(function (authResult) {
                app.log('YAcquired token successfully: ' + pre(authResult));
              //  window.location = 'search.html?id=' + testUserId;
            }, function(err) {
                app.error("Failed to acquire token silently: " + pre(err));
            });
        }, function(err) {
            app.error("Unable to get User ID from token cache. Have you acquired token already? " + pre(err));
        });
    },
    readTokenCache: function () {
        if (app.authContext == null) {
            app.error('Authentication context isn\'t created yet. Create context first');
            return;
        }

        app.authContext.tokenCache.readItems()
        .then(function (res) {
            var text = "Read token cache successfully. There is " + res.length + " items stored.";
            if (res.length > 0) {
                text += "The first one is: " + pre(res[0]);
            }
            app.log(text);

        }, function (err) {
            app.error("Failed to read token cache: " + pre(err));
        });
    },
    clearTokenCache: function () {
        if (app.authContext == null) {
            app.error('Authentication context isn\'t created yet. Create context first');
            return;
        }

        app.authContext.tokenCache.clear().then(function () {
            app.log("Cache cleaned up successfully.");
        }, function (err) {
            app.error("Failed to clear token cache: " + pre(err));
        });
    }

};
var Ptsleft = 5;
function getPtsAwardedTtoday() {
    // alert(jsonData);

    //alert("userID = "+userID);
    var userID = getQueryVariable("id");
    // alert("getPtsAwardedTtoday");
    // alert(document.getElementById("sender").value);
    //var landmarkID = $(this).parent().attr('data-landmark-id');
     var postData = $(this).serialize();
     document.getElementById("sendMessage").disabled = true;

    $.ajax({
        type: 'GET',
        dataType: "jsonp",
        data: { sender: userID },
        crossDomain: true,
        url: 'http://keckmed.usc.edu/TrojanPts/WebServices/TrojanPtsWS.asmx/GetPtsAwardedToday',
        success: function (data, text) {
            //console.log(data);
            Ptsleft = 5 - Number(data);
            //alert(Ptsleft);
            var messege = "You have awarded " + Number(data) + " point(s) today. You have " + Ptsleft + " to award.";
            
            document.getElementById("PtsAllowed").innerHTML = messege;
            document.getElementById("sendMessage").disabled = false;
            //alert(data);
        },
        error: function (jqXHR, exception,err) {
            // console.log(data);
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
                alert(err);
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else if (jqXHR.status == 200) {
                msg = 'You successfully awarded Trojan Pts!';
            }
            else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            //$('#post').html(msg);
           // alert(msg);

        }
    });
}
function getfeed() {
    //alert("getPtsAwardedTtoday");

    $.ajax({
        type: 'GET',
        dataType: "jsonp",
        data: { sender: "test" },
        crossDomain: true,
        url: 'http://keckmed.usc.edu/TrojanPts/WebServices/TrojanPtsWS.asmx/GetPtsFeed',
        success: function (data, text) {
            for (i = 0; i < data.length; i++) {
              
                var TP_Row = '<tr>';
                var TP_Details = "<td><strong>" + data[i].Employee + " - " + data[i].TotalPts + "Pts</strong><br>" + data[i].Message + "<br>From:<i>" + data[i].Sender + "</i></td>";
                TP_Row = TP_Row + TP_Details;
                TP_Row = TP_Row + '</tr>';

                $('#TP_List > tbody:last').append(TP_Row);
            }            
        },
        error: function (jqXHR, exception, err) {
            // console.log(data);
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
                alert(err);
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else if (jqXHR.status == 200) {
                msg = 'You successfully awarded Trojan Pts!';
            }
            else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            //$('#post').html(msg);
            // alert(msg);

        }
    });
}
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}
$(document).ready(function () {
    // alert("ready");
   
    var userID = getQueryVariable("id");
   // alert("UserID = " + userID);
  

    $('form').submit(function (e) {
        e.preventDefault();
        var ptsawarded = document.getElementById("pts").value;
        //alert("Pts awarded = " + ptsawarded + " - Pts left - " + Ptsleft);
        if (ptsawarded < Ptsleft) {
            var submitdata = true;
            document.getElementById("peerreq").style.display = "none"
            document.getElementById("attrireq").style.display = "none"
            document.getElementById("messagereq").style.display = "none"
            if (!validateemail(document.getElementById("peer").value)) {
                document.getElementById("peer").value = "";
                document.getElementById("peerreq").style.display = "block";
                submitdata = false;
            }
            if (document.getElementById("message").value == "") {
                document.getElementById("messagereq").style.display = "block";
                submitdata = false;
            }
            if (document.getElementById("authenticity").checked == false && document.getElementById("innovative").checked == false
                && document.getElementById("compassion").checked == false && document.getElementById("professionalism").checked == false
                && document.getElementById("collegiality").checked == false && document.getElementById("courtesy").checked == false
                && document.getElementById("efficiency").checked == false && document.getElementById("communication").checked == false
                && document.getElementById("leadership").checked == false && document.getElementById("teamwork").checked == false
                && document.getElementById("known").checked == false) {
                document.getElementById("attrireq").style.display = "block";
                submitdata = false;
            }

            if (submitdata) {
                document.getElementById("mainview").style.display = "none";
                document.getElementById("loadingdiv").style.display = "block";
                var data = $(this).serializeFormJSON();
               // alert("userID = "+userID);
                document.getElementById("sender").value = userID;
                // alert("here2");
                // alert(document.getElementById("sender").value);
                //var landmarkID = $(this).parent().attr('data-landmark-id');
                var postData = $(this).serialize();
                var jsonData = JSON.stringify({
                    form: $('#trojanPtform').serialize()
                });
                // alert(jsonData);
                $.ajax({
                    type: 'POST',
                    dataType: "jsonp",
                    data: postData,
                    url: 'http://keckmed.usc.edu/TrojanPts/WebServices/TrojanPtsWS.asmx/AwardTrojanPt',
                    success: function (data, text) {
                        //console.log(data);
                        //alert('Your comment was successfully added');
                        document.getElementById("peer").value = "";
                        document.getElementById("message").value = "";
                        document.getElementById("authenticity").checked = false;
                        document.getElementById("innovative").checked = false;
                        document.getElementById("compassion").checked = false;
                        document.getElementById("professionalism").checked = false;
                        document.getElementById("collegiality").checked = false;
                        document.getElementById("courtesy").checked = false;
                        document.getElementById("efficiency").checked = false;
                        document.getElementById("communication").checked = false;
                        document.getElementById("leadership").checked == false;
                        document.getElementById("teamwork").checked = false;
                        document.getElementById("known").checked = false;
                        document.getElementById("loadingdiv").style.display = "none";
                        document.getElementById("donediv").style.display = "block";
                        
                    },
                    error: function (jqXHR, exception) {
                        // console.log(data);
                        var msg = '';
                        if (jqXHR.status === 0) {
                            msg = 'Not connect.\n Verify Network.';
                        } else if (jqXHR.status == 404) {
                            msg = 'Requested page not found. [404]';
                        } else if (jqXHR.status == 500) {
                            msg = 'Internal Server Error [500].';
                        } else if (exception === 'parsererror') {
                            msg = 'Requested JSON parse failed.';
                        } else if (exception === 'timeout') {
                            msg = 'Time out error.';
                        } else if (exception === 'abort') {
                            msg = 'Ajax request aborted.';
                        } else if (jqXHR.status == 200) {
                            msg = 'You successfully awarded Trojan Pts!';
                        }
                        else {
                            msg = 'Uncaught Error.\n' + jqXHR.responseText;
                        }
                        //$('#post').html(msg);
                        alert(msg);
                       
                    }
                });
            }
        }
        else
        {
            alert("You cannot award more points than " + Ptsleft);
        }
        return false;
    });

    (function ($) {
        $.fn.serializeFormJSON = function () {

            var o = {};
            var a = this.serializeArray();
            $.each(a, function () {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };
    })(jQuery);
    
    function validateemail(x) {
        if (x == "")
            return false;
        var atpos = x.indexOf("@");
        var dotpos = x.lastIndexOf(".");
        if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= x.length) {
            //alert("Not a valid e-mail address");
            return false;
        }
        return true;
    }
})
function CloseDoneDiv() {
    document.getElementById("donediv").style.display = "none";
    //document.getElementById("mainview").style.display = "block";
    window.location = 'feed.html';
}
function toggleMenu1() {
    // menu must be always shown on desktop/tablet
    //alert("toggleMenu");
    if (document.body.clientWidth > 480) return;
    var cl = document.body.classList;
    if (cl.contains('left-nav')) { cl.remove('left-nav'); }
    else { cl.add('left-nav'); }
}