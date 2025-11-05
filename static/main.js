import { Action } from "./modules/action.js";
import { buildCategoryInput } from "./modules/category.js";
import { Timer } from "./modules/timer.js";

function restoreBackup() {
  localStorage.setItem("actions", localStorage.getItem("backupActions"));
  localStorage.setItem("timers", localStorage.getItem("backupTimers"));
  location.href = location.href;
}

buildCategoryInput();
Action.loadFromLocalStorage();
Timer.loadFromLocalStorage();

document.getElementById("action-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
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
