    let queue = [];
    let todayqueue = [];

function doCheckAll(e) {
  e.preventDefault();

  fetch("/api/fetchAll", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then(response => response.json())
    .then(result => {
      if (result.code === 200) {
        queue = result.data;
        console.log(queue[0]._id);
        for (let i = 0; i < 9; i++) {
          let front = document.getElementById("flipcard" + i);
          let back = document.getElementById("flipcardback" + i);
          let _id = document.getElementById("_id" + i);

          //let vocab = result.data[i];
          if (queue.length > 0) {
            let vocab = queue.shift();
            front.innerHTML = vocab.title;
            back.innerHTML = vocab.content;
            _id.innerHTML = vocab._id;
          } else {
            front.innerHTML = "";
            back.innerHTML = "";
          }
          document.getElementById("fp" + i).addEventListener("click", event => {
            let thisFront = document.getElementById("flipcard" + i);
            let thisBack = document.getElementById("flipcardback" + i);
            let this_id = document.getElementById("_id" + i);
            fetch("/api/mark", {
              method: "POST",
              body: JSON.stringify({
                data: [
                  {
                    _id: this_id.innerHTML,
                    isRemembered: 1
                  }
                ]
              }),
              headers: { "Content-Type": "application/json" }
            })
              .then(response => response.json())
              .then(result => {
                console.log(result.code)
                if (result.code === 200) {
                  if (queue.length > 0) {
                    let replace = queue.shift();
                    thisFront.innerHTML = replace.title;
                    thisBack.innerHTML = replace.content;
                    this_id.innerHTML = (replace._id);
                  } else {
                    thisFront.innerHTML = "";
                    thisBack.innerHTML = "";
                    this_id.innerHTML = "";
                  }
                } else {
                  alert(result.msg);
                }
              });
            if (queue.length > 0) {
              let replace = queue.shift();
              front.innerHTML = replace.title;
              back.innerHTML = replace.content;
            } else {
              front.innerHTML = "";
              back.innerHTML = "";
            }
          });
        }
      } else {
        alert(result.msg);
        console.log("fail");
      }
    });
}

function doCheckReviewToday(e) {
  e.preventDefault();

  fetch("/api/fetch", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then(response => response.json())
    .then(result => {
      if (result.code === 200) {
        todayqueue = result.data;
        for (let i = 0; i < 9; i++) {
          let front = document.getElementById("flipcard" + i);
          let back = document.getElementById("flipcardback" + i);
          let _id = document.getElementById("_id" + i);

          //let vocab = result.data[i];
          if (todayqueue.length > 0) {
            let vocab = todayqueue.shift();
            front.innerHTML = vocab.title;
            back.innerHTML = vocab.content;
            _id.innerHTML = vocab._id;
          } else {
            front.innerHTML = "";
            back.innerHTML = "";
          }
          document.getElementById("fp" + i).addEventListener("click", event => {
            let thisFront = document.getElementById("flipcard" + i);
            let thisBack = document.getElementById("flipcardback" + i);
            let this_id = document.getElementById("_id" + i);
            fetch("/api/mark", {
              method: "POST",
              body: JSON.stringify({
                data: [
                  {
                    _id: this_id.innerHTML,
                    isRemembered: 1
                  }
                ]
              }),
              headers: { "Content-Type": "application/json" }
            })
              .then(response => response.json())
              .then(result => {
                if (result.code === 200) {
                  if (todayqueue.length > 0) {
                    let replace = todayqueue.shift();
                    thisFront.innerHTML = replace.title;
                    thisBack.innerHTML = replace.content;
                    document.getElementById("_id" + i).innerHTML(replace._id);
                  } else {
                    thisFront.innerHTML = "";
                    thisBack.innerHTML = "";
                    this_id.innerHTML = "";
                  }
                } else {
                  alert(result.msg);
                }
              });
          });
        }
        if (todayqueue.length <= 0) {
          alert("All done! Nothing to review today!");
        }
      } else {
        alert(result.msg);
        console.log("fail");
      }
    });
}
