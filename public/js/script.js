// var Peer = require('simple-peer');
// var peer = new Peer({
//   initiator: location.hash === '#init', //are they first initiator
//   trickle: false
// });

// var userId;

// //lets get our own ID
// peer.on('signal', function (data){
//   userId = JSON.stringify(data);
//   console.log("My Id: " + userId);
// });
let gPeerObject = null;
let gInitialized = false;
let gUserName = null;
let gPeerId = null;
let gNumberOfPeers = 0;
let gVideoStream = null;
let gCurrentRoomMembers = [];
let gConnections = [];
let gStreams = [];
let gKeepAliveResponses = [];
let gSent = [];
let gTimeoutCounts = {};

$(document).ready(function() {

});

//added a timeout requirement to get kicked, peers must miss 5 messages before getting booted.
window.setInterval(function(){
  if(gKeepAliveResponses.length != gSent.length)
  {
    console.log("gKeepAliveResponses: " + gKeepAliveResponses.length);
    console.log("gSent " + gSent.length)  
  }
    
    for(var i = 0; i < gSent.length; i++)
    {
      var alive = false;
      var streamIds = [];
      for(var j = 0; j < gKeepAliveResponses.length; j++)
      {
        //if we find one
        if(gKeepAliveResponses[j].imAlive === gSent[i]){
          // console.log(gKeepAliveResponses[j].imAlive + " is alive");
          alive = true;
          gTimeoutCounts[gKeepAliveResponses[j].imAlive] = 0; //reset timeout count.
        }
      }
      //console.log("alive: "+alive);
      if(!alive)
      {
        //get the stream id from a peer id.
        //console.log("alive was false for "+gSent[i]);
        for(var x = 0; x < gStreams.length; x++){
          if(gSent[i] === gStreams[x].peer){
            gTimeoutCounts[gStreams[x].peer]++;
            // console.log("timeout count incremented for peer: "+gStreams[x].peer);
            if(gTimeoutCounts[gStreams[x].peer] >= 2)
            {
              if(document.getElementById(gStreams[x].streamObject.id))
              {
                document.getElementById(gStreams[x].streamObject.id).remove();
              }    
            }
          }
        }
      }
    }
  
  gKeepAliveResponses = [];
  gSent = [];
  
  encodedMessage();
  
}, 2000);

$.loginSuccess = function() {
  $("#welcome").fadeOut("slow", function() {
    $("#success").fadeIn("slow",function() {
      $("#mainApp").fadeIn("slow", function() {
       createPeer();
      });
    });
  });
};

$.registerSuccess = function(){
  $("#regSuccess").fadeIn("slow");
};

$.fail420 = function(){
  $("#fail420").fadeIn("slow");
}

$.regFail = function(){
  $("#regFail").fadeIn("slow");
}

$.invalInfo = function(){
  $("#invalInfo").fadeIn("slow");
}

$.createSuccess = function(){
  $("#createSuccess").fadeIn("slow");
};

$.joinSuccess = function(){
  $("#joinSuccess").fadeIn("slow");
};

function enableVideo(){
    //createPeer();
    var getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
  getUserMedia(
    { video: true, audio: true },
    function(stream) {
      console.log("stream created: " + stream);
      var video = document.getElementById("localVideo");
      gVideoStream = stream; //for global use
      video.srcObject = stream;
      video.onloadedmetadata = function(e) {
        video.play();
      };
      document.getElementById("createRoom").disabled = false;
      document.getElementById("joinRoom").disabled = false;
      document.getElementById("roomId").disabled = false;
    },
    function(err) {
      console.log("Failed to get local stream", err);
    }
  );
}

function createPeer() {
  console.log("creating peer... \n");
  gPeerObject = new Peer(/*gUserName.replace("@", "").replace(".", ""), */{
    path: "/",
    debug: true
  });

  //callback for once the peerObject is opened/ready.
  gPeerObject.on('open', function(id) {
    console.log("my peer id is: " + id);
    gPeerId = id;
  });

  gPeerObject.on('error', function(error) {
    console.log("ERROR: Problem with peer: "+error.type);
  });
  
  gPeerObject.on('connection', function(conn) {
    console.log("Chat connected to another peer!");
    var connPresent = false;
    gConnections.forEach(connection => {
      if(connection.peer.localeCompare(conn.peer) === 0)
        connPresent = true;
    })
    if(!connPresent){
      //var returnConn = gPeerObject.connect(conn.peer);
      gConnections.push(conn);
      gTimeoutCounts[conn.peer] = 0;
    }
    
    conn.on('data', function(data) {
      receiveData(data);
    });
    
  });
  
  //on recieve call
  gPeerObject.on('call', function(call) {
    console.log("Answering a call. call.peer: "+call.peer);
    
    //if the user has already enabled video.
    if(gVideoStream)
    {
      console.log("Answering with video stream.");
      call.answer(gVideoStream);
    }else{
      console.log("Answering without video stream.");
      call.answer();
    }
    
    //when the stream starts, create a video element for the calling user and inject it into the mainApp container
    call.on("stream", function(stream) {
      console.log("[Peer] Stream started. injecting video. peer: "+stream.id);
      
      if(document.getElementById(stream.id) === null) {
        gStreams.push({streamObject:stream, peer: call.peer});
        var videoElement = document.createElement("video");
        videoElement.id = stream.id;
        //var remoteVideo = document.getElementById("receivedVideo"+numberOfPeers);
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = function(e) {
          videoElement.play();
          videoElement.width = "360px";
          videoElement.height = "240px";
          videoElement.classList.add("receivedVideo");
        };
        //grab peerId from call and append to the list?
        document.getElementById("videoContainer").appendChild(videoElement);
        gNumberOfPeers++;
        
        console.log("gCurrentRoomMembers: "+gCurrentRoomMembers);
        gCurrentRoomMembers.push(call.peer);
      }
    });
    
  });
}

//function to call another peer, probably will be tied to an onclick attribute for the user to call someone else
  function callUser(username) {
    //we can create this element later
    
    //console.log("gvidstream: " + gVideoStream);
    
    const call = gPeerObject.call(username, gVideoStream);
    
    //console.log("call: " + call);

    call.on('stream', function(stream) {
      console.log("[Call] Call was answered by remote peer! Injecting Video. stream id: "+stream.id);
      //inject video into a new video element.
      console.log("stream: "+stream);
      if(document.getElementById(stream.id) === null)
      {
        gStreams.push({streamObject: stream, peer:call.peer});
        var videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        
        videoElement.onloadedmetadata = function(e) {
          videoElement.play();
          videoElement.width = "360px";
          videoElement.height = "240px";
          videoElement.classList.add("receivedVideo");
        };
        
        videoElement.id = stream.id //"receivedVideo"+gNumberOfPeers;
      
        document.getElementById("videoContainer").appendChild(videoElement);
        gNumberOfPeers++;
      }
      
   
    });
  }

function login() {
  let email = document.getElementById("inputEmail3").value;
  let password = document.getElementById("inputPassword3").value;

  fetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(async function(response) {
    if (response.status === 200) {
      gUserName = email;
      $.loginSuccess();
    } else {
      $.invalInfo();
    }
  });
}

function register() {
  let email = document.getElementById("inputEmail3").value;
  let password = document.getElementById("inputPassword3").value;

  fetch("/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(function(response) {
    if (response.ok) {
      $.registerSuccess();
    } else if (response.status === 420) {
      $.fail420();
    } else {
      $.regFail();
    }
  });
}

function disableVideo()
{
  document.getElementById("localVideo").srcObject = null;
  gVideoStream.getTracks().forEach(track => track.stop());
  document.getElementById("createRoom").disabled = true;
  document.getElementById("joinRoom").disabled = true;
  document.getElementById("roomId").disabled = true;
}

function message() {
  console.log(gConnections);
  let text = document.getElementById("chatMessage").value;
  for(let i=0; i<gConnections.length; i++){
    console.log("Sending to: " +  gConnections[i].peer);
    gConnections[i].send({"username":gUserName, text});
  }
  
  let newMessage = document.createTextNode(gUserName + ": " + text + "\n");
  let chat = document.getElementById("chatbox");
  chat.appendChild(newMessage);
}

function encodedMessage() {
  console.log("Checking if all users are still active... gConnections.length: "+gConnections.length);
  gKeepAliveResponses = [];
  gSent = [];
  for(let i=0; i<gConnections.length; i++){
    console.log("Sending to: " +  gConnections[i].peer + " Are they alive?");
    gConnections[i].send({"keepAlive":gUserName,
                         "requestingPeer": gPeerId});
    gSent.push(gConnections[i].peer);
  }
}


function createRoom(){
  var roomId = document.getElementById("roomId").value;
  
  var sendVal = {"username":gPeerId, "roomId":roomId};
  
  // stop our form submission from refreshing the page
      event.preventDefault();
      
      fetch("/createRoom", {
        method:'POST',
        body:JSON.stringify(sendVal),
        headers:{
          "Content-Type":"application/json"
        }
      })
      .then( response => response.json() )
      .then( json => {
        $.createSuccess();
        gCurrentRoomMembers.push(gPeerId);
        document.getElementById("currentRoom").innerHTML = "Current Room: " + roomId;
        document.getElementById("createRoom").disabled = true;
        document.getElementById("joinRoom").disabled = true;
        document.getElementById("turnOffVideo").disabled = true;
        document.getElementById("turnOnVideo").disabled = true;
        document.getElementById("roomId").disabled = true;
      })
}

function joinRoom(){
  var roomId = document.getElementById("roomId").value;
  
  var sendVal = {"username":gPeerId, "roomId":roomId};
  
  // stop our form submission from refreshing the page
      event.preventDefault();
      
      fetch("/joinRoom", {
        method:'POST',
        body:JSON.stringify(sendVal),
        headers:{
          "Content-Type":"application/json"
        }
      })
      .then( response => response.json() )
      .then( json => {
        json.forEach(member => {
          if(member.localeCompare(gPeerId) != 0) {
            gCurrentRoomMembers.push(member);
            var conn = gPeerObject.connect(member);
            
            conn.on('open', function() {
              console.log("connection opened for chat.");
              gTimeoutCounts[conn.peer] = 0;
              gConnections.push(conn);
              
              conn.on('data', function(data) {
                receiveData(data);
              })
              
            });
          }
        });
        $.joinSuccess();
        document.getElementById("currentRoom").innerHTML = "Current Room: " + roomId;
        document.getElementById("createRoom").disabled = true;
        document.getElementById("joinRoom").disabled = true;
        document.getElementById("turnOffVideo").disabled = true;
        document.getElementById("turnOnVideo").disabled = true;
        document.getElementById("roomId").disabled = true;
        callAllUsers();
      })
}

function callAllUsers()
{
  console.log(gCurrentRoomMembers[0]);
  for(var i = 0; i < gCurrentRoomMembers.length; i++)
  {
    if(gCurrentRoomMembers[i] !== gPeerId)
    {
      console.log("Calling a user! "+gCurrentRoomMembers[i]);
      callUser(gCurrentRoomMembers[i]);   
    }
  }
}

function receiveData(data){
  console.log("DATA RECEIVED ON CHAT PIPELINE.");
      if(data.username)
      {
        let newMessage = document.createTextNode(data.username + ": " + data.text + "\n");
        let chat = document.getElementById("chatbox");
        chat.appendChild(newMessage);
      }else if(data.keepAlive)
      {
        // console.log("Received request to see if I am still alive");
        //the requesting peer's peerId
        var requestingPeer = data.requestingPeer;
        //find this id in gConnections.
        for(var i = 0; i < gConnections.length; i++)
        {
          if(gConnections[i].peer === requestingPeer)
          {
            // console.log("Sending response that I am still alive to " + gConnections[i].peer);
                gConnections[i].send({"imAlive": gPeerId,
                                      "streamId": gVideoStream.id});
          }
        }
      }else if(data.imAlive)
      {
        console.log("Got a response that peer " + data.imAlive + " is still alive.");
        gKeepAliveResponses.push(data);
      }
}