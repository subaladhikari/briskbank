"use strict";

// Toast message helper button and event listener
// -------------------------------------------------------- //
const helpBtn = document.querySelector(".help-btn");
const toasts = document.getElementById("toasts");
let toastMsg = "Try: sa-1234 || jk-5678";
helpBtn.addEventListener("click", () => {
  createNotification();
  toastMsg = "Try: sa-1234 || jk-5678";
});

function createNotification() {
  const notif = document.createElement("div");
  notif.classList.add("toast");
  notif.innerText = toastMsg;
  toasts.appendChild(notif);
  setTimeout(() => {
    notif.remove();
  }, 3000);
}
// -------------------------------------------------------- //

//Script attached data - Could use firebase for storage.
// -------------------------------------------------------- //
const account1 = {
  owner: "Subal Adhikari",
  transactions: [5000, 3400, -150, 340, -300, -20, 50, 3000, -650, -130, 70],
  interestRate: 1.0,
  pin: 1234,
};

const account2 = {
  owner: "Jim Kim",
  transactions: [5000, 700, 50, 90, -3210, -1000, 8500, -30],
  interestRate: 1.1,
  pin: 5678,
};
// -------------------------------------------------------- //

//Generate account object. Ready for use as JSON.
const accounts = [account1, account2];

// -------------------------------------------------------- //
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".total__value--in");
const labelSumOut = document.querySelector(".total__value--out");
const labelSumInterest = document.querySelector(".total__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app--container");
const containerTransactions = document.querySelector(".transactions");

const loginForm = document.querySelector(".login");
const btnLogin = document.querySelector(".login__btn");
const btnLogout = document.querySelector(".btn--logout");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnLoanPin = document.querySelector(".form__inputloan--pin");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");
// -------------------------------------------------------- //

// -------------------------------------------------------- //
// Functions

// Show user data into display board
const displayTransactions = function (transactions, sort = false) {
  containerTransactions.innerHTML = "";

  const movs = sort ? transactions.slice().sort((a, b) => a - b) : transactions;

  movs.forEach(function (mov) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
      <div class="transactions__row">
        <div class="transactions__type transactions__type--${type}"> ${type}</div>
        <div class="transactions__value">${mov}$</div>
      </div>
    `;
    containerTransactions.insertAdjacentHTML("afterbegin", html);
  });
};

// Display the current balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.transactions.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}$`;
};

// Display the account total
const calcDisplaytotal = function (acc) {
  const incomes = acc.transactions
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}$`;

  const out = acc.transactions
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}$`;

  const interest = acc.transactions
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}$`;
};

// Auto create username based on user full name
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

// Invoker
createUsernames(accounts);

//Update display texts
const updateUI = function (acc) {
  // Display transactions
  displayTransactions(acc.transactions);
  // Display balance
  calcDisplayBalance(acc);
  // Display total
  calcDisplaytotal(acc);
};

// Functions
// -------------------------------------------------------- //

// -------------------------------------------------------- //
// Event handlers
let currentAccount;
// Logout event listener
btnLogout.addEventListener("click", function () {
  location.reload();
  return false;
});

//User login section
btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();
  //Look for the account username
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  // Match the username and pin to the data
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    document.body.style.overflow = "visible";
    document.body.style.backgroundSize = "0 0";
    btnLogout.classList.toggle("hidden");

    // Remove footer and login form
    document.querySelector(".login--item").style.display = "none";
    document.querySelector("footer").style.display = "none";
    labelWelcome.style.fontSize = "2.5rem";
    // Display UI and message
    labelWelcome.textContent = `Welcome, ${
      currentAccount.owner.split(" ")[0]
    }!`;
    containerApp.style.opacity = 100;
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();
    // Update UI
    updateUI(currentAccount);
  } else {
    // Login credentials incorrent display messeage
    toastMsg = "Incorrect credential.";
    helpBtn.click();
  }
});
//User login section

// Transfer money to event
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  // Guard clause
  if (!receiverAcc) {
    toastMsg = "Transfer failed!";
    helpBtn.click();
    setTimeout(function () {
      helpBtn.click();
    }, 750);
    inputTransferAmount.value = "";
    inputTransferTo.value = "";
    return;
  }
  inputTransferAmount.value = inputTransferTo.value = "";
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.transactions.push(-amount);
    receiverAcc.transactions.push(amount);
    // Update UI
    setTimeout(function () {
      updateUI(currentAccount);
    }, 2000);
  }
});
// Transfer money to event

// Request loan event
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  console.log(btnLoanPin.value);
  if (Number(btnLoanPin.value) === currentAccount.pin) {
    const amount = Number(inputLoanAmount.value);
    if (
      amount > 0 &&
      currentAccount.transactions.some((mov) => mov >= amount * 0.1)
    ) {
      // Add movement
      currentAccount.transactions.push(amount);
      // Update UI
      setTimeout(function () {
        updateUI(currentAccount);
      }, 1000);
    }
    inputLoanAmount.value = "";
    btnLoanPin.value = "";
  } else {
    toastMsg = "Loan denied!";
    helpBtn.click();
    inputLoanAmount.value = "";
    btnLoanPin.value = "";
  }
});
// Request loan event

// Close account event
btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    // Delete account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});
// Close account event

// Sort elements
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayTransactions(currentAccount.transactions, !sorted);
  sorted = !sorted;
});
// Sort elements

// -------------------------------------------------------- //

// -------------------------------------------------------- //
// Countdown timer
function startTimer(duration) {
  let timer = duration,
    minutes,
    seconds;
  setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    labelTimer.textContent = minutes + ":" + seconds;

    if (--timer < 0) {
      location.reload();
      return false;
    }
  }, 1000);
}

// 15 minutes session
startTimer(60 * 15);
// -------------------------------------------------------- //
