var loggedInUser = null;
let ws;
let CLIENT_ID;

window.onload = function() {
  ws = new WebSocket('ws://' + document.domain + ":8001") // TODO Un-hardcode port!
  console.log(ws)

  ws.onmessage = (event) => {
    console.log(event);
    let msg = JSON.parse(event.data);
    console.log(msg);
    handleMessage(msg);
  }

  // Hide elements; hidden attribute on elements doesn't seem to play well
  // with bootstrap, so can't just initialize w/ everything hidden.
  toggleVoting(false)
  showVoteConfirmMessage(false)
  showVoteActionButtons(false)
  showVoteStats(false)
  showChat(false)

  const logOutButton = document.getElementById( 'logoutButton' );
  const welcomeText = document.getElementById('welcomeText')
  const timeBreakDown = document.getElementById('timeBreakDown')
  if(logOutButton != null){
    logOutButton.addEventListener("click", logOut);
  }

  fetch("/getTimeBreakDown").then(async function (response){
    var body = await response.json()
    timeBreakDown.innerHTML = body.timeString;
  })

  fetch("/getUser").then(async function(response) {
    var body = await response.json();
    console.log("Current user is: ", body.username);
    CLIENT_ID = body.id;
    loggedInUser = body.username;
    welcomeText.innerHTML = "Welcome, " + loggedInUser

    console.log("Sendig register request...")
    ws.send(JSON.stringify({
      event: "REGISTER_ME",
      id: CLIENT_ID
    }))

  });
}

function logOut(e){
    e.preventDefault();
    fetch("/logout").then(async function(response) {
      console.log("Logging out");
      window.location.href = "/";
    });
}

function sendStart() {
  console.log("Sending start!")
  ws.send(JSON.stringify({
    event: "START"
  }))
}

function handleMessage(msg) {
  if(msg.event === "CHAT_MESSAGE") {
   addMessage(msg);
  }
  // If we're showing chat, first hide voting
  else if(msg.event === "SHOW_CHAT") {
    toggleVoting(false)
    showChat(msg.bool)
  }
  // If we're showing voting, first hide chat
  else if(msg.event === "GET_VOTES") {
    console.log("GET VOTES RECIEVED!")
    showChat(false)
    toggleVoting(msg.type);
    showVoteActionButtons(true);
  }
  else if(msg.event === "TICK") {
    timeLeft = msg.time;
    var minsLeft = Math.floor(timeLeft / 60);
    var secsLeft = timeLeft - (minsLeft * 60);
    //TODO: for some reason the screen reader reads the time as 24: whatever seconds left when theres just seconds left make it so that just the seconds show up when 0 minutes left
    document.getElementById("timerDisplay").innerHTML = "Time remaining - " + minsLeft + ":" + pad(secsLeft, 2);
  }
  else if(msg.event === "ALL_MESSAGES") {
    for(let i = 0; i < msg.messages.length; i++) {
      addMessage(msg.messages[i])
    }
  }
  else if (msg.event === "COMMENT_VOTE") {
      // if the message is a comment vote we need to update the value of the comment score
      // get comment score value and add or subtract depending on upvote or downvote
      let comment = document.getElementById('showscore' + msg.msgNumber);
      comment.innerText = msg.score;
  }
  else if(msg.event === "GAME_STARTED") {
    console.log("RECEIVED GAME STARTED:", msg.value)
    if(msg.value) {
      start();
      console.log("Message: ", msg)
      // Check which phase we're on
      if(msg.phase === "CHAT") {
        showChat(true)
      }
      else if(msg.phase ==="INITIAL") {
        console.log("Toggling voting!!!")
        toggleVoting("INITIAL")
        showVoteActionButtons(true)
      }
      else if(msg.phase ==="FINAL") {
        toggleVoting("FINAL")
        showVoteActionButtons(true)
      }
    }
  }
  else if(msg.event === "REGISTER_CONFIRM") {
    console.log("Confirmed register w/ server! serverID: ", msg.id)
    console.log("ClientID: ", CLIENT_ID)
  }
  // If we're showing voteStats, first hide voting and chat
  else if(msg.event === "VOTE_STATS") {
    showChat(false)
    toggleVoting(false)
    updateVoteStats(msg.before, msg.after);
    showVoteStats(true);
  }
  else if(msg.event === "NEW_TOPIC") {
    newTopic();
  }
  else if(msg.event === "START") {
    start();
  }
}

let crowder;
let question = "";
let width = 300;
let height = 219;
var canvas;
let categories = ["food", "memes", "politics", "misc"];
function setup() {
  crowder = loadImage("https://cdn.glitch.com/fc616293-4b24-40ce-a4d1-55b135064e19%2Finset-change_my_mind_meme-001-300x219.jpg?v=1600559576794");
}
function change_question(quest) {
    question = quest;
    let div = document.getElementById("sketch-holder");
    div.title = question;
    console.log("Question changed to: ", question);
}

// idk where this is used but it is necessary
function draw() {
  height = windowHeight/2.7;
  width = height * 1.37 * 1.05;
  canvas = createCanvas(width, height);

  canvas.parent('sketch-holder');
  background(crowder);
  rotate(-PI/8);
  text(question,width/6,height*0.77,width/3);
};
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function sendVote(vote) {
  ws.send(JSON.stringify({
    event: "VOTE",
    id: CLIENT_ID,
    vote: vote,
  }))  
  showVoteActionButtons(false);
  showVoteConfirmMessage(true);
  setTimeout(() => {showVoteConfirmMessage(false)}, 5000)
}

let timeLeft = 0;

fetch('/getTopic').then(res => res.json()).then(res => {
    change_question(res);
});
let voteButton = document.getElementById("send");
voteButton.addEventListener("click", (e) => {
    e.preventDefault()
    const rbs = document.querySelectorAll('input[name="category"]');
    let selectedValue;
    for (const rb of rbs) {
        if (rb.checked) {
            selectedValue = rb.value;
            break;
        }
    }
    fetch("/sendVote", {
        method: "POST",
        body: JSON.stringify({user: "test", category: selectedValue}),
        headers: {'Content-Type': 'application/json'}
    })
})

function start() {
  // Hide everything when new round starts and wait for server to send instructions
  showStartButton(false);
  showVoteActionButtons(false);
  showVoteStats(false);
  showChat(false);

  fetch('/getTopic').then(res => res.json()).then(res => {
      change_question(res);
  });
  messageCount = 0;
}
let messageCount = 0;