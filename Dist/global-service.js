import uService from "./user-service.js";

/** All global variables here */
const url = "https://demo-corso-commit.acm-e.com/api/moneyTransactions/";
const transactions = [];
let balance = 0; // initial balance always starts from 0
let dataToSave = {};
let incomeOption = true;

/** All selectors here */
const loginContainerSelector = document.getElementById("login");
const userAlertsSelector = document.getElementById("userAlerts");
const appContainerSelector = document.getElementById("appContainer");
const addButtonSelector = document.getElementById("addButton");
const addInputSelector = document.getElementById("addInput");
const addDescriptionInputSelector = document.getElementById("addDescriptionInput");
const incomeOptionSelector = document.getElementById("incomeToggle");
const expenseOptionSelector = document.getElementById("expenseToggle");

/** Function to darken view and show a loading icon
 * @param show (required) is a boolean true/false:
 * when it's true the function creates a new layer to show,
 * when it's false removes the (eventually) created layer
*/
function isLoading(show){
    if(show){
        const layer = document.createElement("div");
        layer.classList.add("loadingLayer");
        layer.id = "loading";
        loginContainerSelector.appendChild(layer);

        const loadingIcon = document.createElement("img");
        loadingIcon.src = "./Assets/loadingIcon.svg";
        layer.appendChild(loadingIcon);
        return;
    } else{
    const layer = document.getElementById("loading");
    layer.remove();
    }
}

/**
 * Function to send a GET request to the API
 * @param {*} insertedId is the variable passed from the login page,
 * used to know if the id matches with a real account
 * @returns null value if there're no accounts matching the id
 * or returns the response in json if there's an account matching.
 * Array.prototype.push.apply requires as params an array + the data to insert inside it
 * (eg."transactions" is the global empty array, "response.transactions" are data to fill it)
 */
async function getUserData(insertedId){
    console.log(`Checking ${insertedId}...`);
    const promise = await fetch(url + insertedId,{
    method:'GET'
    });

    if(promise.ok){
        const response = await promise.json();
        return response;
    } else{
        return null;
    }
}

/** Functions that cope with the login interface:
 * @function showLoginError adds an error message when the inserted user id is invalid,
 * @returns @param errorMessage, used to remove() the first error message if the user fails again;
 * @function toggleLogin switches visible/invisible classes to hide login and show user content
*/

function showLoginError(){
    const errorMessage = document.createElement("div");
    errorMessage.classList.add("errorLogin");
    errorMessage.textContent = "Please enter the right ID";
    userAlertsSelector.appendChild(errorMessage);
    return errorMessage;
}

/** Function that handles showing user data on the interface.
 * @function loadCurrentExpense asks the API for all user data and splits them in:
 * @function setUserInfo (user-service.js file) requiring @param response.id
 * @function setCategories (user-service.js file) requiring @param userCategories
 * @function setTransactions (user-service.js file) requiring @param response.transactions
 * I've also created an event to auto-reaload the background size (gradient):
 * @event contentChangeEvent gets dispatched when content inside appContainer changes.
 * @alert warns the user about not receiving any response from the API
  */
async function loadCurrentExpense(response){
    if(response){
        uService.setUserInfo(response.id);
        let userCategories = uService.userCategories;
        uService.setCategories(userCategories);
        Array.prototype.push.apply(transactions, response.transactions);
        uService.setTransactions(transactions);
        setBalance(transactions);
        appContainerSelector.dispatchEvent(contentChangeEvent);
    } else {
        alert("No response from server");
    }
    isLoading(false);
}

/**
 * Function to set current user balance, takes
 * @array transactions (= @param response.transactions)
 * and foreach transaction in the array, adds the "amount" value to balance
 * (@balance is initialized at zero), then replaces the total on the interface
 */
function setBalance(transactions){ // expects an array of transactions
    transactions.forEach(transaction => {
        balance += transaction.amount;
    });
    const balanceElement = document.getElementById("balance");
    balanceElement.innerText = balance.toFixed(2) + " €"; // toFixed(2) displays balance with 2 decimals
}

function toggleLogin() {
    loginContainerSelector.classList.remove("visible");
    loginContainerSelector.classList.add("hidden");
    appContainerSelector.classList.remove("hidden");
    appContainerSelector.classList.add("visible");
}


async function saveData(url, dataToSave) {
    console.log("Saving data..", dataToSave);
    try {
        const response = await fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSave)
        });

        const jsonData = await response.json();
        setBalance(jsonData.transactions);
        return jsonData;
    } catch (error) {
        console.error(error);
    }
}



/** Helful global functions to quickly generate new elements
 * @function createButton to handle a new button creation
 * @function createInput to handle a new input creation
 * both require @param parent to appendChild to
 * @param innertText to specific the type of element created
 * @param classes to add specific classes to the element
*/
function createButton(parent, innerText, classes){
    const button = document.createElement("button");
    button.innerText = innerText;
    classes.forEach(className => button.classList.add(className));
    parent.appendChild(button);
    return button;
}

function createInput(parent, inputType, classes){
    const input = document.createElement("input");
    input.type = inputType;
    classes.forEach(className => input.classList.add(className));
    parent.appendChild(input);
    return input;
}




/* clicking the add button */
const addButtonEvent = function() {
    addButtonSelector.addEventListener("click", function() {
        let newAmount = addInputSelector.value;
        let newDescription = addDescriptionInputSelector.value;
        while(newAmount.length === 0) {
            addInputSelector.classList.add("error");
            return;
        } addInputSelector.classList.remove("error");
        clickAddAmount(newAmount, newDescription, incomeOption);

        /* inputs turn back empty */
        addInputSelector.value = "";
        addDescriptionInputSelector.value = "";
    });
}

/* function to handle click on "Add" button */
async function clickAddAmount(newAmount, newDescription, incomeOption) {

    console.log("Click add amount function: Clicked!")
    let currentData = await getUserData(); // getting user current data
    let currentUserId = currentData.id; // selecting user id

    // checks if incomeOption is true, otherwise counts the amount as an expense (expenseOption)
    const amount = incomeOption ? Number(newAmount) : -Number(newAmount);

    // here adding a new transaction
    const newTransaction = {
        description: newDescription,
        timestamp: new Date().toISOString(),  // sends current POST time and date
        amount: amount
    };

    // gets the local array of current transactions and add the new one
    transactions.push(newTransaction);

    // creates the new data object with the updated transactions
    dataToSave = {
        ...uService.setUserInfo(currentUserId),
        transactions: transactions
    };

    // Save the new data to the server
    await saveData(url, dataToSave);

     // handle the new transaction and updates balance
     uService.createTransaction(newTransaction);
     setBalance(transactions);
}

/* clicking the income button (default) */
const incomeOptionEvent = function() {
    incomeOptionSelector.addEventListener("click", function() {
    incomeOption = true;
    incomeOptionSelector.classList.remove("notSelected");
    expenseOptionSelector.classList.add("notSelected");
    })
}

/* clicking the expense button */
const expenseOptionEvent = function() {
    expenseOptionSelector.addEventListener("click", function() {
        incomeOption = false;
        expenseOptionSelector.classList.remove("notSelected");
        incomeOptionSelector.classList.add("notSelected");
    })
}

/* creating a personalized event to adjust background when content changes (adding/removing) */
const contentChangeEvent = new Event("contentChanged");
appContainerSelector.addEventListener("contentChanged", function() {
    var gradientBackground = document.querySelector(".gradient-background");
    // delaying event in 1s
    setTimeout(function() {
        gradientBackground.style.height = appContainerSelector.scrollHeight + "px";
    }, 1);
});





export default {
    transactions: transactions,
    showLoginError: showLoginError,
    toggleLogin: toggleLogin,
    loadCurrentExpense:(insertedId)=> loadCurrentExpense(insertedId),
    getUserData:(insertedId)=> getUserData(insertedId),
    saveData:(url, data = {})=> saveData(url, data = {}),
    isLoading:(show)=> isLoading(show),
    handleNewTransaction:(data)=> handleNewTransaction(data),
    setBalance:(transactionData)=> setBalance(transactionData),
    createButton:(parent, innerText, classes)=> createButton(parent, innerText, classes),
    createInput:(parent, inputType, classes)=> createInput(parent, inputType, classes),
    addButtonEvent: addButtonEvent,
    incomeOptionEvent: incomeOptionEvent,
    expenseOptionEvent: expenseOptionEvent
}
