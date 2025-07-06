// ========== DATA STORAGE ==========
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let trash = JSON.parse(localStorage.getItem("trash")) || [];
let loans = JSON.parse(localStorage.getItem("loans")) || [];
let lendings = JSON.parse(localStorage.getItem("lendings")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ========== HELPERS ==========
function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("trash", JSON.stringify(trash));
  localStorage.setItem("loans", JSON.stringify(loans));
  localStorage.setItem("lendings", JSON.stringify(lendings));
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function logTask(task) {
  tasks.unshift({ time: new Date().toLocaleString(), task });
  updateLocalStorage();
  renderTasks();
}

// ========== TASKS ==========
function renderTasks() {
  const list = document.getElementById("recent-tasks");
  if (!list) return;
  list.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.time}: ${t.task}`;
    list.appendChild(li);
  });
}

// ========== TRANSACTION ==========
document.getElementById("transaction-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const desc = document.getElementById("description").value;
  const amount = +document.getElementById("amount").value;
  const people = document.getElementById("people").value;
  const date = new Date().toLocaleString();
  transactions.push({ id: Date.now(), desc, amount, people, date });
  logTask(`Added transaction: ${desc} ₹${amount}`);
  updateLocalStorage();
  renderTransactions();
  e.target.reset();
});

function renderTransactions(data = transactions) {
  const list = document.getElementById("transaction-list");
  if (!list) return;
  list.innerHTML = "";
  let total = 0;
  data.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `${t.desc} - ₹${t.amount} (${t.date}) <button onclick="deleteTransaction(${t.id})">🗑️</button>`;
    list.appendChild(li);
    total += t.amount;
  });
  document.getElementById("balance").textContent = total.toFixed(2);
}

function deleteTransaction(id) {
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    trash.push(transactions[index]);
    logTask(`Deleted transaction: ${transactions[index].desc}`);
    transactions.splice(index, 1);
    updateLocalStorage();
    renderTransactions();
    renderTrash();
  }
}

function renderTrash() {
  const list = document.getElementById("trash-list");
  if (!list) return;
  list.innerHTML = "";
  trash.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `${t.desc} - ₹${t.amount} <button onclick="recoverTransaction(${t.id})">♻️</button>`;
    list.appendChild(li);
  });
}

function recoverTransaction(id) {
  const index = trash.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions.push(trash[index]);
    logTask(`Recovered transaction: ${trash[index].desc}`);
    trash.splice(index, 1);
    updateLocalStorage();
    renderTransactions();
    renderTrash();
  }
}

// ========== LOAN ==========
document.getElementById("loan-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("loan-name").value;
  const amount = +document.getElementById("loan-amount").value;
  const people = document.getElementById("loan-people").value;
  const dueDate = document.getElementById("loan-date").value;
  const date = new Date().toLocaleDateString();
  loans.push({ id: Date.now(), name, amount, people, date, dueDate, repaid: false });
  logTask(`Loan added: ${name} ₹${amount} to ${people}`);
  updateLocalStorage();
  renderLoans();
  renderPeople();
  e.target.reset();
});

function renderLoans() {
  const list = document.getElementById("loan-list");
  if (!list) return;
  list.innerHTML = "";
  loans.forEach(l => {
    const li = document.createElement("li");
    li.innerHTML = `${l.name} - ₹${l.amount} (to ${l.people}) [${l.date} ➡ ${l.dueDate}] ${l.repaid ? "✅ Repaid" : `<button onclick="repayLoan(${l.id})">Mark Repaid</button>`}`;
    list.appendChild(li);
  });
}

function repayLoan(id) {
  const loan = loans.find(l => l.id === id);
  if (loan && !loan.repaid) {
    loan.repaid = true;
    logTask(`Loan repaid: ${loan.name} from ${loan.people}`);
    updateLocalStorage();
    renderLoans();
    renderPeople();
  }
}

// ========== LENDING ==========
document.getElementById("lending-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("lending-name").value;
  const amount = +document.getElementById("lending-amount").value;
  const people = document.getElementById("lending-people").value;
  const dueDate = document.getElementById("lending-date").value;
  const date = new Date().toLocaleDateString();
  lendings.push({ id: Date.now(), name, amount, people, date, dueDate, repaid: false });
  logTask(`Lending added: ${name} ₹${amount} to ${people}`);
  updateLocalStorage();
  renderLendings();
  renderPeople();
  e.target.reset();
});

function renderLendings() {
  const list = document.getElementById("lending-list");
  if (!list) return;
  list.innerHTML = "";
  lendings.forEach(l => {
    const li = document.createElement("li");
    li.innerHTML = `${l.name} - ₹${l.amount} (to ${l.people}) [${l.date} ➡ ${l.dueDate}] ${l.repaid ? "✅ Repaid" : `<button onclick="repayLending(${l.id})">Mark Repaid</button>`}`;
    list.appendChild(li);
  });
}

function repayLending(id) {
  const lending = lendings.find(l => l.id === id);
  if (lending && !lending.repaid) {
    lending.repaid = true;
    logTask(`Lending repaid: ${lending.name} from ${lending.people}`);
    updateLocalStorage();
    renderLendings();
    renderPeople();
  }
}

// ========== PEOPLE ==========
function renderPeople() {
  const list = document.getElementById("people-list");
  if (!list) return;
  list.innerHTML = "";
  const persons = {};
  [...loans, ...lendings].forEach(entry => {
    if (!persons[entry.people]) persons[entry.people] = [];
    persons[entry.people].push(entry);
  });
  for (const person in persons) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${person}</strong><ul>${persons[person].map(e => `<li>${e.name} - ₹${e.amount} (${e.repaid ? "Repaid" : "Pending"})</li>`).join("")}</ul>`;
    list.appendChild(li);
  }
}

// ========== NAVIGATION ==========
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const target = link.getAttribute("data-section");
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("visible"));
    document.getElementById(target).classList.add("visible");
  });
});

// ========== FILTER ==========
function filterTransactions() {
  const query = document.getElementById("filter").value.toLowerCase();
  const filtered = transactions.filter(t => t.desc.toLowerCase().includes(query));
  renderTransactions(filtered);
}

// ========== EXPORT ==========
function exportToCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = [headers.join(",")].concat(data.map(d => headers.map(h => `"${d[h] ?? ""}"`).join(",")));
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename + ".csv";
  a.click();
}

// ========== THEME ==========
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

// ========== INIT ==========
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
renderTransactions();
renderTrash();
renderLoans();
renderLendings();
renderPeople();
renderTasks();