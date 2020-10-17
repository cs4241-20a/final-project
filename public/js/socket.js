let ws = undefined;
function initReceiverSocket(){
    if(ws !== undefined) {return}
    const socketReady = new Promise((resolve, reject) => {
        ws = new WebSocket(`ws://localhost:2000`);
        ws.onopen = () => {

            fetch("/mydata")
                .then(response => response.json())
                .then(json => {

                    ws.send(JSON.stringify({type:"sendingUsername", username:json.username}));
                    ws.onmessage = __msg => {
                        //console.log(__msg);
                        const msg = JSON.parse(__msg.data);
                        console.log(msg);
                        let sender = msg.sender;
                        if(sender) {
                            console.log("you have a new message from " + sender);

                            // Set style of something to visible
                            document.getElementById("mailStatus").style.display = "block"
                        }
                    }

                })
        }
    })
    return socketReady
}

function notifyReceiver(receiver){
    const socketReady = new Promise((resolve, reject) => {
        ws = new WebSocket(`ws://localhost:2000`);
        ws.onopen = () => {
            console.log("sending notification to " + receiver);
            ws.send(JSON.stringify({type:"notification", sender:document.getElementById("userHandle").innerText,
                receiver:receiver}))
        }
    })
    return socketReady
}
