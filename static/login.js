let connected = false;
let loggedIn = false;
let lastConnected = null;

const recheckPeriod = 10000; // check connection every 10s

async function checkLogin() {
  try {
    const res = await fetch("/api/logincheck");
    if (res.ok) {
      connected = true;
      lastConnected = new Date();
      const json = await res.json();
      loggedIn = json.loggedIn ?? false;
      updateDisplay();
    } else {
      connected = false;
      loggedIn = false;
      updateDisplay();
    }
  } catch (e) {
    console.log("Failed to connect:", e);
    connected = false;
    loggedIn = false;
    updateDisplay();
  }
}

let wasConnected = false;
let wasLoggedIn = false;
function updateDisplay() {
  let setb = (id, b) => { document.getElementById(id).style.display = b ? "block" : "none"; };
  if (wasConnected !== connected) {
    setb("connected", connected);
    setb("notConnected", !connected);
    wasConnected = connected;
  }
  if (wasLoggedIn !== loggedIn) {
    setb("loggedIn", loggedIn);
    setb("notLoggedIn", !loggedIn);
    wasLoggedIn = loggedIn;
  }
  if (!lastConnected) {
    for (const elt of document.getElementsByClassName("last-connected")) {
      elt.style.display = "none";
    }
  } else {
    for (const elt of document.getElementsByClassName("last-connected")) {
      elt.style.display = "inline";
    }
    const secs = Math.floor((new Date() - lastConnected) / 1000);
    for (const elt of document.getElementsByClassName("last-connected-s")) {
      elt.innerText = secs;
    }
  }
}

updateDisplay();
setInterval(updateDisplay, 500);
checkLogin();
setInterval(checkLogin, recheckPeriod);
