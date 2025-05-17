function showMessage(id, message, type) {
  const msg = document.getElementById(id);
  if (!msg) return;
  msg.textContent = message;
  msg.className = `message ${type}`;
  msg.style.display = "block";
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("regUser").value.trim();
    const password = document.getElementById("regPass").value;
    const confirm  = document.getElementById("regPassConfirm").value;
    const msgId    = "regMsg";

    if (!username || !password || !confirm) {
      showMessage(msgId, "Please fill in all fields.", "error");
      return;
    }
    if (password !== confirm) {
      showMessage(msgId, "Passwords do not match.", "error");
      return;
    }
    if (localStorage.getItem(username)) {
      showMessage(msgId, "Username already exists.", "error");
      return;
    }

    localStorage.setItem(username, password);
    showMessage(msgId, "Registered successfully! Redirecting...", "success");

    window.location.href = "login.html";
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value;
    const stored  = localStorage.getItem(username);

    if (!username || !password) {
      showMessage("loginMsg", "Please enter username and password.", "error");
      return;
    }
    if (!stored || stored !== password) {
      showMessage("loginMsg", "Wrong username or password.", "error");
      return;
    }

    localStorage.setItem("currentUser", username);
    showMessage("loginMsg", "Login successful! Redirecting...", "success");
    
    window.location.href = "dashboard.html";
  });
}

document.querySelectorAll('a[href="index.html"]').forEach(link => {
  link.addEventListener("click", () => localStorage.removeItem("currentUser"));
});

const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const userElem = document.getElementById("forgotUser");
    const emailElem= document.getElementById("forgotEmail");
    const username = userElem.value.trim();
    const email    = emailElem.value.trim();

    if (!username || !email) {
      showMessage("forgotMsg", "Please fill in all fields.", "error");
      return;
    }
    if (!localStorage.getItem(username)) {
      showMessage("forgotMsg", "Username not found.", "error");
      return;
    }

    localStorage.setItem("resetUser", username);
    window.location.href = "reset.html";
  });
}

const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const newPass = document.getElementById("newPass").value;
    const confirm = document.getElementById("confirmPass").value;
    const user    = localStorage.getItem("resetUser");

    if (!newPass || !confirm) {
      showMessage("resetMsg", "Please fill in all fields.", "error");
      return;
    }
    if (newPass !== confirm) {
      showMessage("resetMsg", "Passwords do not match.", "error");
      return;
    }

    localStorage.setItem(user, newPass);
    localStorage.removeItem("resetUser");
    showMessage("resetMsg", "Password reset successful! Redirecting...", "success");
    
    window.location.href = "login.html";
  });
}

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
let savingGoal = parseFloat(localStorage.getItem('savingGoal')) || 0;
let currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;

function resetTransactions() {
  if (confirm('Are you sure you want to delete all transactions? This action cannot be undone.')) {
    transactions = [];
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateDashboard();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('transDate').valueAsDate = new Date();
  document.getElementById('savingGoal').value = savingGoal;

  const resetBtn = document.getElementById('resetTransactions');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetTransactions);
  }
  
  updateDashboard();

  const clearBtn = document.getElementById('clearAllData');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllData);
  }

  const goalsForm = document.getElementById('goalsForm');
  if (goalsForm) {
    goalsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const newGoal = parseFloat(document.getElementById('savingGoal').value);
      if (!isNaN(newGoal) && newGoal >= 0) {
        savingGoal = newGoal;
        localStorage.setItem('savingGoal', savingGoal);
        updateDashboard();
      }
    });
  }
});

const transactionForm = document.getElementById("transactionForm");
if (transactionForm) {
  transactionForm.addEventListener("submit", function (e) {
    e.preventDefault();
    
    const transaction = {
      id: Date.now().toString(),
      description: document.getElementById("transDesc").value.trim(),
      category: document.getElementById("transCategory").value,
      amount: parseFloat(document.getElementById("transAmount").value),
      date: document.getElementById("transDate").value
    };

    if (isNaN(transaction.amount) || transaction.amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }


    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    this.reset();
    document.getElementById('transDate').valueAsDate = new Date();
    
    updateDashboard();
  });
}

const budgetForm = document.getElementById("budgetForm");
if (budgetForm) {
  budgetForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const budget = parseFloat(document.getElementById("monthlyBudget").value);
    
    if (isNaN(budget) || budget < 0) {
      alert("Please enter a valid budget amount.");
      return;
    }
    
    monthlyBudget = budget;
    localStorage.setItem('monthlyBudget', monthlyBudget);
    updateDashboard();
  });
}

function updateDashboard() {
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

  currentSavings = monthlyBudget - totalExpenses;
  const savingsProgress = savingGoal > 0 ? Math.min((currentSavings / savingGoal) * 100, 100) : 0;
  const budgetUsed = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;
  const budgetProgress = document.getElementById('budgetProgress');
  const budgetText = document.getElementById('budgetText');
  const monthlySavingsElement = document.getElementById('monthlySavings');

  if (monthlySavingsElement) {
    const monthlyNet = monthlyBudget - totalExpenses;
    monthlySavingsElement.textContent = `RM${Math.max(0, monthlyNet).toFixed(2)}`;
  }
  
  if (budgetProgress && budgetText) {
    budgetProgress.style.width = `${Math.min(budgetUsed, 100)}%`;
    budgetProgress.style.backgroundColor = budgetUsed > 80 ? '#f44336' : '#4CAF50';
    budgetText.textContent = `${Math.round(budgetUsed)}%`;
  }

  const savingsProgressBar = document.getElementById('savingsProgress');
  const savingsText = document.getElementById('savingsText');
  if (savingsProgressBar && savingsText) {
    savingsProgressBar.style.width = `${savingsProgress}%`;
    savingsProgressBar.style.backgroundColor = savingsProgress >= 100 ? '#4CAF50' : '#2e5d2e';
    savingsText.textContent = `${Math.round(savingsProgress)}%`;
  }
  
  const remainingAmountEl = document.getElementById('remainingAmount');
  const timeToGoalEl = document.getElementById('timeToGoal');
  
  if (savingGoal > 0) {
    const remainingAmount = Math.max(0, savingGoal - currentSavings);
    
    if (remainingAmountEl) {
      remainingAmountEl.textContent = `RM${remainingAmount.toFixed(2)}`;
    }
    
    if (timeToGoalEl) {
      if (remainingAmount > 0) {
        timeToGoalEl.textContent = 'Set a monthly budget to see timeline';
      } else {
        timeToGoalEl.textContent = 'Goal reached!';
      }
    }
  } else {
    if (remainingAmountEl) remainingAmountEl.textContent = '-';
    if (timeToGoalEl) timeToGoalEl.textContent = '-';
  }
  
  const transactionsList = document.getElementById('transactionsList');
  if (transactionsList) {
    transactionsList.innerHTML = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(transaction => `
        <div class="transaction-item">
          <div class="transaction-desc">${transaction.description}</div>
          <div class="transaction-amount" style="color: ${transaction.amount < 0 ? '#d32f2f' : '#2e8b57'}">
            RM${Math.abs(transaction.amount).toFixed(2)}
          </div>
          <div class="transaction-category">${transaction.category}</div>
          <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
        </div>
      `).join('');
  }

  document.querySelectorAll('.amount.savings').forEach(el => el.textContent = `RM${monthlyBudget.toFixed(2)}`);
  document.querySelectorAll('.expense').forEach(el => el.textContent = `RM${totalExpenses.toFixed(2)}`);
  
  localStorage.setItem('lastIncome', monthlyBudget);
  localStorage.setItem('lastExpenses', totalExpenses);
}

document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("currentUser");
  
  // Removed reference to unused class '.daily-budget'

  const greeting = document.getElementById('greeting');
  if (greeting) {
    const hour = new Date().getHours();
    greeting.textContent = 
      hour < 12 ? "Good Morning!" :
      hour < 18 ? "Good Afternoon!" : "Good Evening!";
  }

  const updateStats = () => {
    const income = parseFloat(localStorage.getItem('lastIncome') || 0);
    const expenses = parseFloat(localStorage.getItem('lastExpenses') || 0);
    
    document.querySelectorAll('.income').forEach(el => el.textContent = `RM${income.toFixed(2)}`);
    document.querySelectorAll('.expense').forEach(el => el.textContent = `RM${expenses.toFixed(2)}`);

    // Removed reference to unused class '.budget'
  };

  // Always update stats since '.quick-stats' class doesn't exist
  updateStats();
  setInterval(updateStats, 1000);
});