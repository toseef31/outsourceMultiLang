'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', '$state', '$http', '$stateParams', 'FileUploader','$timeout', '$location', '$window', 'Authentication', 'Socket', 'toastr', 'Conversation', 'UserSchema', 'ChatMessages', '$rootScope' ,'uuid2', 'ngAudio',
    function ($scope, $state, $http, $stateParams, FileUploader, $timeout, $location, $window, Authentication, Socket, toastr, Conversation, UserSchema, ChatMessages, $rootScope,  uuid2, ngAudio) {
        // Create a messages array
        $scope.messages = [];
        $scope.chatmessages = [];
        $scope.conversationWithObj = {};

        // If user is not signed in then redirect back home
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.currentUserData = Authentication.user;
        // //console.log(Authentication.user);

        Conversation.find({
            filter: {
                where: {
                    userOne: Authentication.user.username
                }
            }
        }, function (resp) {
            $scope.conversations = resp;
            $scope.okCallFunction = 1;
            angular.forEach($scope.conversations, function (conv, i) {

                UserSchema.findOne({
                    filter: {
                        where: {
                            username: conv.userTwo
                        },
                        fields: ['displayName', 'username', 'email', 'profileImageURL', 'status']
                    }
                }, function (cuser) {
                    $scope.conversations.imgUrl = cuser.profileImageURL;
                    Object.assign(conv, cuser);
                });

                // For localhost
                // $http({
                //   url: '/api/users/username/' + conv.userTwo,
                //   method: 'GET'
                // }).then(function (suc) {
                //     $scope.conversations.imgUrl = suc.data.profileImageURL;
                //     Object.assign(conv, suc.data);
                //     console.log('user:', $scope.conversations);
                // });
            });
            
        });

        /*Attach file*/
        $scope.uploader = new FileUploader({
          url: 'api/contest/contestFile',
          alias: 'newContestFile'
        });

        $scope.uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
          // console.info('onWhenAddingFileFailed', item, filter, options);
         };
        $scope.uploader.onAfterAddingFile = function(fileItem) {
          // console.info('onAfterAddingFile', fileItem);
          $scope.item = fileItem;
        };
        // $scope.uploader.onAfterAddingAll = function(addedFileItems) {
        //   console.info('onAfterAddingAll', addedFileItems);
        // };
        $scope.uploader.onBeforeUploadItem = function(item) {
          // console.info('onBeforeUploadItem', item);
        };
        $scope.uploader.onProgressItem = function(fileItem, progress) {
          // console.info('onProgressItem', fileItem, progress);
        };
        // $scope.uploader.onProgressAll = function(progress) {
        //   console.info('onProgressAll', progress);
        // };
        $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
          // console.info('onSuccessItem', fileItem, response, status, headers);
          $scope.sucMsg = '파일이 성공적으로 업로드 되었습니다.'  ;
          $scope.errMsg = '';
          $scope.attachedFileLink = response;
          $scope.attachedFileName = fileItem.file.name;
        };
        $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
          // console.info('onErrorItem', fileItem, response, status, headers);
          $scope.errMsg = response.message;
          $scope.sucMsg = '';
        };
        // $scope.uploader.onCancelItem = function(fileItem, response, status, headers) {
        //   console.info('onCancelItem', fileItem, response, status, headers);
        // };
        $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
          // console.info('onCompleteItem', fileItem, response, status, headers);
          if(status === 400){
            $scope.errMsg = response.message;
            $scope.sucMsg = '';
          }
          else{
            $scope.sucMsg = '파일이 성공적으로 업로드 되었습니다.';
            $scope.errMsg = '';
          }
        };

        $scope.sendFile = function(projLink){
            var file = '<a href="'+$scope.attachedFileLink+'"' + ' target="_self" ' +' download="'+$scope.attachedFileName+'">' +$scope.attachedFileName+'</a>';
            
            Socket.emit('NewChatMessage', {
                sender: Authentication.user.username,
                conversationWith: $scope.conversationWith,
                message: file,
                conversationProject: projLink,
                cid: $scope.conversationWithObj.cid
            }, function(res){
                console.log('emit response',res);
            });

            ChatMessages.create({
                'sender': Authentication.user.username,
                'message': file,
                'conversationWith': $scope.conversationWith, 
                'conversationProject': projLink,
                'cid': $scope.conversationWithObj.cid
            }, function (resp) {
                $scope.chatmessages.push(resp);
                 document.getElementById("txtForm").reset();
                 $scope.uploader.queue.length = 0;
            });
            $timeout(function() {
             var objDiv = document.getElementById("scrollBottomInbox");
             objDiv.scrollTop = objDiv.scrollHeight;
            }, 100);
        };

        /*end of attach file*/

        // var ROOMID;
        // var ROOM;
        // var ANSWER = false;

        $scope.makeVideoCall = function(_receiver){
            var myWindow = window.open($rootScope.messengerServerAddress+"/#!/messenger/"+_receiver+ "/"+ Authentication.user.username +"/", "", "width=100%");
            //console.log(myWindow);
        };

        // Socket.emit('addUser', { email: $scope.currentUserData.email });

         // For Mobile view
         $scope.mobileView = true;
         $scope.contactDetail = true;
         if ($window.innerWidth < 700){
             $scope.mobileView = false;
             $scope.contactDetail = true;
             $scope.messageDetail = function(){
                 if ($scope.contactDetail) {
                     $scope.mobileView = true;
                     $scope.contactDetail = false;
                 } else {
                     $scope.mobileView = false;
                 }
             };
         }

        if ($window.innerWidth < 700){
             $scope.contct = function(){
                 if ($scope.mobileView) {
                     $scope.contactDetail = true;
                     $scope.mobileView = false;
                 } else {
                     $scope.mobileView = true;
                 }
             };
         }
         
         // End Mobile View


        //vide call function
        // $scope.videoCallFunction = function (to) {
        //     //console.log('video function is called');
        //     ROOM = to;
        //     ROOMID = ROOM;
        //     //console.log('THis is room id in videocall function ' + ROOM);
        //     Socket.emit('NewVideoCall', {
        //         to: to,
        //         room: ROOM
        //     });
        // };

        // var calls = $scope.calls = function () {
        //     if (ROOM === ROOMID) {
        //         //console.log('Room and Id are same ' + ROOM);
        //     } else {
        //         ROOM = ROOMID;
        //         //console.log('Room and Id are now samee in else ' + ROOM);
        //     }
        //     //console.log('This is ROOMID in room of function of call' + ROOM);
        //     //console.log('This is only call');
        //     var webrtc;
        //     // var webrtc = new SimpleWebRTC({
        //     //     autoRequestMedia: true,
        //     //     receiveMedia: {
        //     //         offerToReceiveAudio: 1,
        //     //         offerToReceiveVideo: 0
        //     //     }
        //     // });
        //     webrtc.on('readyToCall', function () {
        //         //console.log('Ready to call');
        //         webrtc.joinRoom(ROOM);
        //     });
        // };
        // var videoCalls = function () {
        //     if (ROOM === ROOMID) {
        //         //console.log('Room and Id are same ' + ROOM);
        //     } else {
        //         // ROOM = id;
        //         //console.log('Room and Id are now samee in else ' + ROOM);
        //     }
        //     //console.log('This is id in ROOM of function of video call' + ROOM);
        //     //console.log('This is Video call');
        //     // comment the below line when you uncomment the new SimpleWebRTC
        //     var webrtc;
        //     ////when you uncomment the below lines comment the above line

        //     // var webrtc = new SimpleWebRTC({
        //     //     localVideoEl: 'localVideo',
        //     //     remoteVideosEl: 'remotesVideos',
        //     //     autoRequestMedia: true,
        //     // });
        //     webrtc.on('readyToCall', function () {
        //         //console.log('Ready to call');
        //         //console.log('This is ROOM id in joining ' + ROOM);
        //         webrtc.joinRoom(ROOM);
        //     });
        //     webrtc.on('videoAdded', function (video, peer) {
        //         //console.log('This is id of ROOM ' + ROOM);
        //         // var remoteVideo = document.getElementById('remotesVideos');
        //         //console.log('Video is goinng to be hdden');
        //         // $("#remotesVideos").hide();
        //         Socket.emit('callnotification');
        //         Socket.on('answernotification', function (data) {
        //             //console.log('Answering notification in ' + data);
        //             var btnAnswer = document.createElement("input");
        //             btnAnswer.type = "button";
        //             btnAnswer.value = "Answer";
        //             var btnReject = document.createElement("input");
        //             btnReject.type = "button";
        //             btnReject.value = "Reject";

        //             // //console.log('This is btnReject ' + JSON.stringify(btnReject));

        //             var msgDiv = document.getElementById("msgs");
        //             //console.log('This is div ' + msgDiv);
        //             msgDiv.appendChild(btnAnswer);
        //             msgDiv.appendChild(btnReject);
        //             btnAnswer.onclick = function () {
        //                 //console.log('Video is goinng to be shown');
        //                 ANSWER = true;
        //                 Socket.emit('answer', ANSWER);
        //                 // //console.log('T/his is ANSWER in andar ' + ANSWER);
        //                 // $("#remotesVideos").show();
        //             };
        //             btnReject.onclick = function () {
        //                 webrtc.leaveRoom();
        //             };
        //         });
        //         Socket.on('answers', function (data) {
        //             //console.log('THis is answerr ' + data);
        //             if (data === true) {
        //                 // //console.log('Answer is true');
        //                 // $("#remotesVideos").show();
        //             } else {
        //                 // $("#remotesVideos").hide();
        //             }
        //         });
        //     });
        //     webrtc.on('videoRemoved', function (video, peer) {
        //         // //console.log('video removed ', peer);
        //     });
        //     $scope.screenShare = function () {
        //         // //console.log('button is clicked');
        //         if (webrtc.getLocalScreen()) {
        //             webrtc.stopScreenShare();
        //         } else {
        //             webrtc.shareScreen(function (err) {
        //                 if (err) {
        //                     // //console.log('This is an error ' + err);
        //                 } else {
        //                     // //console.log('screen shared');
        //                 }
        //             });
        //         }
        //     };
        //     // local screen obtained
        //     webrtc.on('localScreenAdded', function (video) {
        //         video.onclick = function () {
        //             video.style.width = video.videoWidth + 'px';
        //             video.style.height = video.videoHeight + 'px';
        //         };
        //         document.getElementById('localScreenContainer').appendChild(video);
        //         // $('#localScreenContainer').show();
        //     });
        //     // local screen removed
        //     webrtc.on('localScreenRemoved', function (video) {
        //         document.getElementById('localScreenContainer').removeChild(video);
        //         // $('#localScreenContainer').hide();
        //     });
        // };
        //END video call code

        // Socket.on("call", function (data) {
        //     // //console.log('This is room id in call ' + ROOM);
        //     ROOM = data.room;
        //     calls();
        // });
        // Socket.on("videoCall", function (data) {
        //     // //console.log('This is room id in call ' + ROOM);
        //     ROOM = data.room;
        //     videoCalls();
        // });

        //it refresh page on click from viewer
        // $scope.reloadPage = function(){
        //     $state.reload();
        // };
         
         // //console.log( 'cccccc', uuid2.newuuid());
        $scope.getConversation = function (conversationWithObj) {
            $scope.disabledMessage = false;

            $scope.conversationWithObj = conversationWithObj;

            $scope.conversationWith =  $scope.conversationWithObj.username;
            $scope.conversationWithName =  $scope.conversationWithObj.displayName;
            $scope.conversationWithProject =  $scope.conversationWithObj.projectTitle;
            $scope.conversationWithProLink =  $scope.conversationWithObj.projectLink;
            ChatMessages.find({
                filter: {
                    where: {
                        cid: $scope.conversationWithObj.cid
                        // and: [{

                        //     or: [{
                        //         conversationWith: $scope.currentUserData.username,
                        //         sender: username
                        //     }, {
                        //         conversationWith: username,
                        //         sender: $scope.currentUserData.username
                        //     }],

                        //     conversationProject: ProjLink
                        // }]
                    }
                }
            }, function (resp) {
                $scope.chatmessages = resp;
                // //cons
                // Find the userTwo to get profile pic
                UserSchema.findOne({
                    filter:{
                        where:{
                            username: conversationWithObj.username
                        },
                        fields: ['profileImageURL']
                    }
                }, function(succ){
                    // //console.log('succxxxxxxxxxxxxxxxxxxxx', succ);
                    //console.log('While get Convo:', $scope.chatmessages.length);
                    $scope.userTwoImgUrl = succ.profileImageURL;
                });

            });
            $scope.scrollBottom();
        };

        $scope.disabledMessage = true;

        // Make sure the Socket is connected
        if (!Socket.socket) {
            Socket.connect();
        }
        
        // Socket.on(Authentication.user.username + 'chatMessage', function (message) {
        Socket.on(Authentication.user.username + 'NewChatMessage', function (message) {
            // show redalert
            $rootScope.msgAlert = true;
            console.log('chat sock');
            $timeout(function() {
             var objDiv = document.getElementById("scrollBottomInbox");
             objDiv.scrollTop = objDiv.scrollHeight;
            }, 10);

            $scope.sound = ngAudio.load("modules/chat/client/sound/msg.mp3");
            $scope.sound.play();
            angular.forEach($scope.conversations, function (conv, i) {
                // changes the status of new message and check if the chat is open
                if (message.sender === conv.userTwo && message.cid === conv.cid && $scope.conversationWith !== $scope.currentUserData.username) {
                    conv.hasUnreadMessages = true;
                }
            });
            if ($scope.conversationWithObj.cid === message.cid) {
                $scope.chatmessages.push(message);
            }
        });

        //to scroll at bottom by default 
        $scope.scrollBottom = function(){
          $timeout(function() {
            var objDiv = document.getElementById("scrollBottomInbox");
            objDiv.scrollTop = objDiv.scrollHeight;
          }, 1000);
          
        };

        //variable to reset the text box of chat
        $scope.masterchat = '';
        $scope.sendMessage = function (_message, projLink) {
            if($scope.txtmessage){


                Socket.emit('NewChatMessage', {
                    sender: Authentication.user.username,
                    conversationWith: $scope.conversationWithObj.userTwo,
                    message: _message,
                    conversationProject: projLink,
                    cid: $scope.conversationWithObj.cid
                });

                ChatMessages.create({
                    'sender': Authentication.user.username,
                    'message': _message,
                    'conversationWith': $scope.conversationWithObj.userTwo, 
                    'conversationProject': projLink,
                    'cid': $scope.conversationWithObj.cid
                }, function (resp) {
                    $scope.txtmessage = '';
                    $scope.chatmessages.push(resp);
                    document.getElementById("txtForm").reset();

                    // Remove the unread mesg signs
                    $rootScope.msgAlert = false;

                    var con = {};
                    con.hasUnreadMessages = false;

                    // console.log('conversation:', $scope.conversationWithObj);

                    Conversation.update({
                        where:{
                            and:[
                                {userOne: $scope.conversationWithObj.userOne},
                                {cid: $scope.conversationWithObj.cid}
                            ] 
                        }
                    }, con, function (conv) {
                        // console.log('conv One:', conv.count);  
                        con.hasUnreadMessages = true;

                        Conversation.update({
                            where:{
                                and:[
                                    {userOne: $scope.conversationWithObj.userTwo},
                                    {cid: $scope.conversationWithObj.cid},
                                    {id: { neq: $scope.conversationWithObj.id} }
                                ] 
                            }
                        }, con, function (conv) {
                            // console.log('conv two:', conv.count);  
                        });
                    });

                    
                    
                    // Make the convo unseen on other end
                    // Conversation.msgSeen({
                    //   cid: $scope.conversationWithObj.cid,
                    //   userTwo: Authentication.user.username,
                    //   seen: false
                    // });

                    // Conversation.msgSeen({
                    //   cid: $scope.conversationWithObj.cid,
                    //   userOne: $scope.conversationWith,
                    //   seen: false
                    // });

                });
                $timeout(function() {
                 var objDiv = document.getElementById("scrollBottomInbox");
                 objDiv.scrollTop = objDiv.scrollHeight;
                }, 10);
            }
        };
        
        // Add an event listener to the 'chatMessage' event
        // Socket.on('chatMessage', function (message) {
        //     $scope.messages.unshift(message);
        //     console.log(message);
        // });

        // Create a controller method for sending messages
        // $scope.sendMessage = function () {
        //     // Create a new message object
        //     var message = {
        //         text: this.messageText
        //     };

        //     // Emit a 'chatMessage' message event
        //     Socket.emit('chatMessage', message);

        //     // Clear the message text
        //     this.messageText = '';
        // };

        // Remove the event listener when the controller instance is destroyed
        // $scope.$on('$destroy', function () {
        //     Socket.removeListener('chatMessage');
        // });

        // ///////////////////////////////////////////////////////////////////////////////
        // //video streamin 
        // $scope.hasStream = false;
        // $scope.roomName = '';
        // $scope.isBroadcasting = '';
        // $scope.prepare = function prepare() {
        //     $scope.$broadcast('prepare');
        // };
        // $scope.start = function start() {
        //     $scope.$broadcast('start');
        // };

        if($stateParams.cid){
            getConvoByCidd($stateParams.cid);
            
            //When redirected to inbox from conv list in header
            var con = {};
            con.hasUnreadMessages = false;
            Conversation.update({
                where:{
                    id: $stateParams.cid
                }
            }, con);
        }

        $scope.getConvoByCid = function(_id){
            $state.go('chat.inbox', {cid:_id}, {notify:false});
            getConvoByCidd(_id);

            $rootScope.msgAlert = false;

            // remove the unread status
            var con = {};
            con.hasUnreadMessages = false;

            // console.log('conversation:', $scope.conversationWithObj);

            Conversation.update({
                where:{
                    and:[
                        {userOne: $scope.conversationWithObj.userOne},
                        {cid: $scope.conversationWithObj.cid}
                    ] 
                }
            }, con, function (conv) {
                // console.log('conv One:', conv.count);  
            });

        };

        /*Fetch convo by cid Twork to do) */
        function getConvoByCidd(_id){
            // console.log('cid:', _id);
            $scope.isLoading = true;

            $scope.scrollBottom(); 
            Conversation.find({
                filter: {
                    where: {
                        id: _id
                    }
                }
            }, function (resp) {
                // console.log('convo:', resp[0]);
                var con = resp[0];
                $scope.disabledMessage = false;
                $scope.conversationWithObj = con;
                $scope.conversationWithProject =  $scope.conversationWithObj.projectTitle;
                $scope.conversationWithProLink =  $scope.conversationWithObj.projectLink;

                $scope.okCallFunction = 1;

                // get messages of that convo
                UserSchema.findOne({
                    filter:{
                        where:{
                            username: con.userTwo
                        }
                    }
                }, function(suc){
                    $scope.userTwoImgUrl =  suc.profileImageURL;
                    $scope.conversationWith =  suc.username;
                    $scope.conversationWithName =  suc.displayName;
                    ChatMessages.find({
                        filter: {
                            where: {
                                cid: con.cid
                            }
                        }
                    }, function (resp) {
                        // console.log('Messages:', resp);
                        $scope.isLoading = false;
                        $scope.chatmessages = resp;
                    });
                }, function(err){

                    // only for Local (test)
                    // ChatMessages.find({
                    //     filter: {
                    //         where: {
                    //             cid: con.cid
                    //         }
                    //     }
                    // }, function (resp) {
                    //     $scope.isLoading = false;
                    //     $scope.chatmessages = resp;
                    // });
                    // $scope.isLoading = false;
                });
                
            }, function(err){
                $scope.isLoading = false;
            });
        }


    }
]);


