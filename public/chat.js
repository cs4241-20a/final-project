let ws,
  msgs = [];
var chatbox = document.getElementById("chatbox");
var chatbutton = document.getElementById("send");
const name = document.getElementById("entername");
var chatname = document.getElementById("savename");

window.onload = function() {
  ws = new WebSocket(`wss://${window.location.host}`);

  ws.onopen = () => {
    // ws.send("a new client has connected" + name.value);
    //     const m = {
    //       address: "/join",
    //       name: "charlie"
    //     };
    //     const m2 = {
    //       address: "/chatMessage",
    //       username: "charlie",
    //       value: "test"
    //     };
    // ws.send(JSON.stringify(m));
    //     ws.onmessage = __msg => {
    //       const msg = JSON.parse(__msg.data);
    //       switch (msg.address) {
    //         case "/join":
    //           //do something
    //           break;
    //         default:
    //       }
    //       //add message to the end of the msgs array
    //       //re-assign to trigger UI update
    //     };
  };

  ws.onmessage = msg => {
    const span = document.createElement("span");
    span.innerText = msg.data;
    document.body.appendChild(span);
  };
};

const send = function() {
  const txt = document.querySelector("chatbox").value;
  ws.send(txt); //global namespace
}; //send the message and the room on line 46

chatbutton.addEventListener("click", event => {
  ws.send(name.value + ": " + chatbox.value + "\n");
  const sentMsg = document.createElement("span");
  sentMsg.innerText = name.value + ": " + chatbox.value + "\n";
  document.body.appendChild(sentMsg);
});

chatname.addEventListener("click", event => {
  ws.send(name.value + " " + "has joined the chat \n");
  const confirmJoin = document.createElement("span");
  confirmJoin.innerText = "You have joined the chat, Say hi! \n";
  document.body.appendChild(confirmJoin);
  hideNameForm();
  showMsgForm();
});

function hideNameForm() {
  var form = document.getElementById("inputname");
  if (form.style.display === "none") {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}

function showMsgForm() {
  var form = document.getElementById("sendmsg");
  if (form.style.display === "none") {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}
