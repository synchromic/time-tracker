import { capitalize } from "./utils.js";

let categories = ["none", "work", "play", "exercise", "sleep"];
let categoryColors = { "none": "#ffffff", "work": "#82e617", "play": "#eb5299", "exercise": "#5287eb", "sleep": "#999999" }

export function makeCategoryBox(category) {
  let div = document.createElement("div");
  div.style.backgroundColor = categoryColors[category] ?? "#ffffff";
  div.style.width = "0.8em";
  div.style.height = "0.8em";
  div.style.border = "1px solid black";
  div.ariaDescription = `Category ${category}`;
  div.title = category === "none" ? "No category" : capitalize(category);
  return div;
}

export function buildCategoryInput() {
  const categoryInputTable = document.getElementById("categories");
  categoryInputTable.innerHTML = "";
  for (const category of categories) {
    const row = categoryInputTable.insertRow();
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.id = `category-${category}`
    radio.name = "category";
    radio.value = category;
    if (category === "none") radio.checked = true;
    row.insertCell().appendChild(radio);
    const label = document.createElement("label");
    label.htmlFor = radio.id;
    label.style.display = "flex";
    label.style.gap = "0.25em";
    label.appendChild(makeCategoryBox(category));
    const labelSpan = document.createElement("span");
    labelSpan.innerText = capitalize(category.charAt(0).toUpperCase() + category.slice(1));
    label.appendChild(labelSpan);
    row.insertCell().appendChild(label);
  }
}
