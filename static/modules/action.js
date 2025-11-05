import { formatDate } from "./utils.js";
import { makeCategoryBox } from "./category.js";

let actions = [];

export class Action {
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
      Action.saveToLocalStorage();
    }
  }

  deleteFromList(update = true) {
    let oldLen = actions.length;
    actions = actions.filter((action) => action.id !== this.id);
    if (update && oldLen !== actions.length) {
      Action.remakeTable();
      Action.saveToLocalStorage();
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

  static saveToLocalStorage() {
    const actionsData = actions.map((action) => action.toJSONObject());
    localStorage.setItem("actions", JSON.stringify(actionsData));
  }

  static loadFromLocalStorage() {
    const localStorageActions = localStorage.getItem("actions");
    if (localStorageActions) {
      localStorage.setItem("backupActions", localStorageActions);
      const data = JSON.parse(localStorageActions)
      actions = data.map(Action.fromJSONObject);
    }
    Action.remakeTable();
  }
}

