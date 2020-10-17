<script>
  let ws, msgs = []
  window.onload = function() {
    ws = new WebSocket( `ws://${window.location.host}:3000` )
    // when connection is established...
    ws.onopen = () => {
		ws.send( 'a new client has connected.' )
      ws.onmessage = msg => {
		  // add message to end of msgs array,
		  // re-assign to trigger UI update
        msgs = msgs.concat([ msg.data ])
      }
    }
  }

  const send = function() {
    const txt = document.querySelector('input').value
    ws.send( txt )
	  // re-assigning to msgs variable triggers UI update
    msgs = msgs.concat([ txt ])
  }
</script>

<input type='text' on:change={send} />

{#each msgs as msg }
  <h3>{msg}</h3>
{/each}

