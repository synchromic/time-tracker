import { formatDuration } from "./utils.js";
import { makeCategoryBox } from "./category.js";

let timers = [];

export class Timer {
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
    Timer.saveToLocalStorage();
  }

  // different from a complete, removes actions too
  deleteFromList(update = true) {
    timers = timers.filter((timer) => timer.id !== this.id);
    this.startAction?.deleteFromList(update);
    Timer.remakeTable();
    Timer.saveToLocalStorage();
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
    Timer.saveToLocalStorage();
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
    this.htmlRow.cells["elapsed"].innerText = formatDuration(diffSec);
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

  static loadFromLocalStorage() {
    const localStorageTimers = localStorage.getItem("timers");
    if (localStorageTimers) {
      localStorage.setItem("backupTimers", localStorageTimers);
      const data = JSON.parse(localStorageTimers)
      timers = data.map(Timer.fromJSONObject);
    }
    Timer.remakeTable();
  }

  static saveToLocalStorage() {
    const timersData = timers.map((timer) => timer.toJSONObject());
    localStorage.setItem("timers", JSON.stringify(timersData));
  }
}

setInterval(Timer.updateTable, 500);
