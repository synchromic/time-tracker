let actions = [];
let timers = [];
let categories = ["none", "work", "play", "exercise", "sleep"];
let categoryColors = { "none": "#ffffff", "work": "#82e617", "play": "#eb5299", "exercise": "#5287eb", "sleep": "#999999" }

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function makeCategoryBox(category) {
  let div = document.createElement("div");
  div.style.backgroundColor = categoryColors[category] ?? "#ffffff";
  div.style.width = "0.8em";
  div.style.height = "0.8em";
  div.style.border = "1px solid black";
  div.ariaDescription = `Category ${category}`;
  div.title = category === "none" ? "No category" : capitalize(category);
  return div;
}

// build category input
const categoryInputTable = document.getElementById("categories");
categoryInputTable.innerHTML = "";
for (const category of categories) {
  const row = categoryInputTable.insertRow();
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.id = `category-${category}`
  radio.name = "category";
  radio.value = category;
  row.insertCell().appendChild(radio);
  row.insertCell().appendChild(makeCategoryBox(category));
  const label = document.createElement("label");
  label.htmlFor = radio.id;
  label.innerText = capitalize(category.charAt(0).toUpperCase() + category.slice(1));
  row.insertCell().appendChild(label);
}

class Action {
  // An action that happens at a single point in time.

  constructor({text, timestamp, id, timed, isStart, category}) {
    this.text = text ?? "";
    this.timestamp = timestamp ?? new Date();
    this.id = id ?? this.timestamp.getTime().toString();
    this.timed = timed ?? false;
    this.isStart = isStart ?? false;
    this.deleted = false;
    this.category = category || "none";
  }

  static fromJSONObject(action) {
    return new Action({
      ...action,
      text: action.text ?? action.action, // TODO: deprecate
      timestamp: new Date(action.timestamp),
    })
  }

  toJSONObject() {
    return { 
      ...this,
      timestamp: this.timestamp.getTime()
    }
  }

  addToList(update = true) {
    if (!actions.some((action) => action.id === this.id)) {
      actions.push(this);
    }
    if (update) {
      Action.remakeTable();
      saveToLocalStorage();
    }
  }

  deleteFromList(update = true) {
    let oldLen = actions.length;
    actions = actions.filter((action) => action.id !== this.id);
    if (update && oldLen !== actions.length) {
      Action.remakeTable();
      saveToLocalStorage();
    }
  }

  makeRow(row) {
    row.innerHTML = "";
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "x";
    deleteButton.addEventListener("click", this.deleteFromList.bind(this));
    row.insertCell().appendChild(deleteButton);
    row.insertCell().innerText = formatDate(this.timestamp);
    row.insertCell().appendChild(makeCategoryBox(this.category));
    row.insertCell().innerText = this.text;
  }

  static remakeTable() {
    const table = document.getElementById("past-actions");
    table.innerHTML = "";
    actions.sort((a, b) => a.timestamp - b.timestamp);
    for (const action of actions) {
      const row = table.insertRow();
      action.makeRow(row);
    }
  }
}

class Timer {
  // An action that is ongoing.

  constructor({text, startTime, id, category}) {
    this.text = text ?? "";
    this.startTime = startTime ?? new Date();
    this.id = id ?? this.startTime.getTime().toString();
    this.htmlRow = null;
    this.startAction = null;
    this.category = category ?? "none";
  }

  static fromJSONObject(timer) {
    return new Timer({
      ...timer,
      startTime: new Date(timer.startTime),
    })
  }

  toJSONObject() {
    return { 
      ...this,
      startTime: this.startTime.getTime()
    }
  }

  addToList(update = true) {
    if (timers.some((timer) => timer.id === this.id)) return;
    timers.push(this);
    this.startAction = new Action({
      text: "start " + this.text,
      timestamp: this.startTime,
      id: this.id + "-ts",
      timed: true,
      isStart: true,
      category: this.category,
    });
    this.startAction.addToList(update);
    Timer.remakeTable();
    saveToLocalStorage();
  }

  // different from a complete, removes actions too
  deleteFromList(update = true) {
    timers = timers.filter((timer) => timer.id !== this.id);
    this.startAction?.deleteFromList(update);
    Timer.remakeTable();
    saveToLocalStorage();
  }

  finish() {
    timers = timers.filter((timer) => timer.id !== this.id);
    const finishAction = new Action({
      text: "finish " + this.text,
      timestamp: new Date(),
      id: this.id + "-tf",
      timed: true,
      isStart: false,
      category: this.category,
    });
    finishAction.addToList(true);
    Timer.remakeTable();
    saveToLocalStorage();
  }

  makeRow(row, now) {
    row.innerHTML = "";
    const finishButton = document.createElement("button");
    finishButton.innerText = "done";
    finishButton.addEventListener("click", this.finish.bind(this));
    row.insertCell().appendChild(finishButton);
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "x";
    deleteButton.addEventListener("click", this.deleteFromList.bind(this));
    row.insertCell().appendChild(deleteButton);
    row.insertCell().id = "elapsed";
    row.insertCell().appendChild(makeCategoryBox(this.category));
    row.insertCell().innerText = this.text;
    this.htmlRow = row;
    this.updateRow(now);
  }

  updateRow(now) {
    if (!this.htmlRow) throw new Error("trying to update timer row that was not made");
    const diffSec = Math.floor((now - this.startTime) / 1000);
    const [remMin, sec] = [Math.floor(diffSec / 60), diffSec % 60];
    const [hr, min] = [Math.floor(remMin / 60), remMin % 60];
    const elapsed = `${hr}:${min}:${sec}`;
    this.htmlRow.cells["elapsed"].innerText = elapsed;
  }

  static remakeTable() {
    const table = document.getElementById("timers");
    table.innerHTML = "";
    timers.sort((a, b) => a.startTime - b.startTime);
    const now = new Date();
    for (const timer of timers) {
      const row = table.insertRow();
      timer.makeRow(row, now);
    }
  }

  static updateTable() {
    const now = new Date();
    for (const timer of timers) {
      timer.updateRow(now);
    }
  }
}

const localStorageActions = localStorage.getItem("actions");
if (localStorageActions) {
  localStorage.setItem("backupActions", localStorageActions);
  const data = JSON.parse(localStorageActions)
  actions = data.map(Action.fromJSONObject);
}
Action.remakeTable();

const localStorageTimers = localStorage.getItem("timers");
if (localStorageTimers) {
  localStorage.setItem("backupTimers", localStorageTimers);
  const data = JSON.parse(localStorageTimers)
  timers = data.map(Timer.fromJSONObject);
}
Timer.remakeTable();
setInterval(Timer.updateTable, 1000);

function formatDate(date) {
  const datePart = date.toLocaleDateString("en-CA"); // "2025-11-03"
  const timePart = date.toLocaleTimeString("en-GB", { hour12: false }); // "09:37:11"
  return `${datePart} ${timePart}`;
}

function saveToLocalStorage() {
  const actionsData = actions.map((action) => action.toJSONObject());
  localStorage.setItem("actions", JSON.stringify(actionsData));
  const timersData = timers.map((timer) => timer.toJSONObject());
  localStorage.setItem("timers", JSON.stringify(timersData));
}

function restoreBackup() {
  localStorage.setItem("actions", localStorage.getItem("backupActions"));
  localStorage.setItem("timers", localStorage.getItem("backupTimers"));
  location.href = location.href;
}

document.getElementById("action-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  console.log(data);
  if (data.get("timed") === "on") {
    new Timer({
      text: data.get("text"),
      category: data.get("category"),
    }).addToList();
  } else {
    new Action({
      text: data.get("text"),
      category: data.get("category"),
    }).addToList();
  }
  e.target.elements["text"].value = "";
});
