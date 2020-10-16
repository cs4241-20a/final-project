import React, { useState, useEffect } from "react";
import { Realtime } from "ably/browser/static/ably-commonjs.js";

import logo from "./logo.svg";
import "./App.css";

window.Ably = new Realtime("xRc4Ow.GkXE4w:ShH50iSzZbI1x88e");

const fetchOptions = (body) => {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
};

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [cheemLeaderboard, setCheemLeaderboard] = useState([]);
  const [userLeaderboard, setUserLeaderboard] = useState([]);
  const [draft, setDraft] = useState("");
  const [draftCheem, setDraftCheem] = useState(null);
  const [cheems, setCheems] = useState([]);

  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);

  const submit = () => {
    if (!draft) return alert("u didmt addmn m commemt");
    if (!draftCheem) return alert("u didnmt pick m cheem");
    fetch("/api/submit", fetchOptions({ message: draft, cheemId: draftCheem }))
      .then((response) => response.json())
      .then(() => {
        setDraft("");
        setDraftCheem(null);
      });
  };

  const login = () => {
    fetch("/login", fetchOptions({ username, password }))
    .then((response) => {
      if(!response.ok){
        return window.alert("mme youmr passmwrod im incorment, trym agaim")
      }
      else {
        response.json()
        .then((json) => {
          if (json._id) {
            window.location.href = "/";
          }
        })
      }
    })
  }

    const upload = () => {
      var upload = window.prompt("emterm m Cheem imagme mURLm tomm uplomadm \n(URL must end with an image type like .png or .jpg)");
      if (upload.trim() != "") {
        try {
          new URL(upload);
        } catch (_) {
          return window.alert("imvalimd imagme mURLmm")
        }

        if(upload.match(/\.(jpeg|jpg|gif|png|webm)$/) != null) {
          fetch("/api/uploadCheem", fetchOptions({ uploadURL: upload }))
          .then(function(response) {
            if (response.status === 200) {
              return window.location.reload(false)
            }
          })
        } else {
          return window.alert("imvalimd imagme mURLmm")
        }
      }
    };

  const logout = () => {
    fetch("/logout");
    setUser(null);
  };
  useEffect(() => {
    fetch("/api/getUser")
      .then((response) => response.json())
      .then((json) => {
        if (!json._id) return;
        setUser(json);
      });
    fetch("/api/getData")
      .then((response) => response.json())
      .then((json) => {
        setMessages(json.chats || []);
        setCheems(json.cheems || []);
        setCheemLeaderboard(json.cheemLeaderboards || []);
        setUserLeaderboard(json.userLeaderboards || []);
        var channel = window.Ably.channels.get("master");
        channel.subscribe("leaderboards", (message) => {
          setCheemLeaderboard(message.data.cheemLeaderboards);
          setUserLeaderboard(message.data.userLeaderboards);
        });
        channel.subscribe("message", (message) => {
          setMessages((prevMessages) => {
            return [...prevMessages, message.data];
          });
        });
      });
  }, []);

  const setDateTime = (date) => {
    if(date == ""){
      return ""
    } else {
      date = new Date(date).toLocaleString("en-us",{weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"})
      return date
    }
  }

  if (user) {
    return (
      <div>
        <div class="container-fluid">
          <nav class="navbar fixed-top navbar-expand-lg navbar-light bg-light">
            <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
              <a class="navbar-brand" href="#">
                Cheem Chat
              </a>
              <ul class="navbar-nav mr-auto mt-2 mt-lg-0"></ul>
              <div class="form-inline my-2 my-lg-0">
                <p class="pt-3 pr-4">{user.strategy} User: {user.username}</p>
                <a
                  class="btn btn-outline-success my-2 my-sm-0"
                  type="submit"
                  id="uploadBtn"
                  onClick={upload}
                >
                  Upload New Cheem
                </a>
                <a
                  class="btn btn-outline-danger my-2 my-sm-0"
                  type="submit"
                  onClick={logout}
                >
                  Logout
                </a>
              </div>
            </div>
          </nav>
        </div>
        <div class="container-fluid mt-5 pt-2">
          <div class="row mt-5">
            <div class="col">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">User Leaderboard</h5>
                  {userLeaderboard
                    .filter((c) => c.messagesSent > 0)
                    .sort((a, b) => (b.messagesSent > a.messagesSent ? 1 : -1))
                    .map((user, index) => (
                      <div class="card mt-1">
                        <div class="card-body">
                          <h5 class="card-title">
                            #{index + 1}: {user.username}
                          </h5>
                          <p class="card-text">
                            {user.messagesSent || 0} messages sent.
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div class="col-7">
              <div class="card">
                <div class="card-body">
                  <textarea
                    value={draft}
                    class="form-control"
                    rows={3}
                    placeholder="Write your caption"
                    resize="none"
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <p class="card-text">and select your cheem</p>
                  <div class="cover-container">
                    {cheems.map((c) => (
                      <a
                        class="cover-item"
                        onClick={() => setDraftCheem(c._id)}
                        href="#"
                        style={{
                          backgroundImage: `url(${c.url})`,
                          opacity: draftCheem == c._id ? 0.5 : 1,
                        }}
                      />
                    ))}
                  </div>
                  <a
                    onClick={submit}
                    value="send"
                    class="btn btn-primary btn-block mt-1"
                  >
                    Send
                  </a>
                </div>
              </div>

              {messages
                .sort((a, b) => (b.ts || 0) - (a.ts || 0))
                .map((m) => (
                  <div class="card mt-2">
                    <div class="card-body">
                      <img
                        src={
                          m.cheemURL ||
                          "https://preview.redd.it/tgy4a5n8i9a41.png?auto=webp&s=c4af6336a2d368723f13f3499d4e495ca9e723a8"
                        }
                        class="card-img-top"
                      />
                      <h5 class="card-title">{m.message}</h5>
                      <p class="card-text">
                        from {m.username || "Anonymous"} : {setDateTime(m.ts)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <div class="col">
              <div class="card">
                <div class="card-body mt-1">
                  <h5 class="card-title">Cheem Leaderboard</h5>
                  {cheemLeaderboard
                    .filter((c) => c.usages > 0)
                    .sort((a, b) => (b.usages > a.usages ? 1 : -1))
                    .map((cheem, index) => (
                      <div class="card mt-1">
                        <div class="card-body">
                          <img
                            src={
                              cheem.url ||
                              "https://preview.redd.it/tgy4a5n8i9a41.png?auto=webp&s=c4af6336a2d368723f13f3499d4e495ca9e723a8"
                            }
                            class="card-img-top"
                          />
                          <h5 class="card-title">
                            #{index + 1}: {cheem.usages || 0} uses
                          </h5>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="App">
      <div className="background" />
      <header className="App-header">
        <img
          src="https://i.imgflip.com/3nzkub.png"
          className="App-logo"
          alt="logo"
        />
        <h1 className="title">Welcome to CheemChat</h1>
        <h2 className="subtitle">
          <i>A Modern and Robust Chat Application</i>
        </h2>
        <a className="btn btn-primary" href="/auth/github">
          Login with Github
        </a>
        <a className="btn btn-success mt-2" href="/auth/deviantart">
          Login with DeviantArt
        </a>
        <div class="card mt-3">
          <div class="card-body">
            <div>
              <div class="form-group">
                <p>Username</p>
                <input
                  type="text"
                  class="form-control"
                  name="username"
                  placeholder="Cheemsburger"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div class="form-group">
                <p>Password</p>
                <input
                  type="password"
                  class="form-control"
                  name="password"
                  placeholder="CHEEMS_R_COOL_2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" class="btn btn-primary" onClick={login}>
                Login
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
