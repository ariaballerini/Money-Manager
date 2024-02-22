import uService from "./user-service.js";
import { current } from "./app.js";
const layer = document.getElementById("loading");
const loginContainerSelector = document.getElementById("login");
const userAlertsSelector = document.getElementById("userAlerts");
const appContainerSelector = document.getElementById("appContainer");
const url = "https://demo-corso-commit.acm-e.com/api/moneyTransactions/";
const transactions = [];

let balance = 0;

/* --------------------------------------------------------------------- */

/** Function to darken view and show a loading icon
 * @param show (required) is a boolean true/false:
 * when it's true the function creates a new layer to show,
 * when it's false removes the (eventually) created layer
*/
function isLoading(show){
    if(show){
        layer.classList.remove("hidden");
        const loadingIcon = document.createElement("img");
        loadingIcon.src = "./Assets/loadingIcon.svg";
        loadingIcon.id = "loadingIcon";
        layer.appendChild(loadingIcon);
        return;
    } else{
        layer.classList.add("hidden");
    }
    const loadingIcon = document.getElementById("loadingIcon")
    loadingIcon.remove();
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

/** Function to add an error message when the inserted user id is invalid,
 * @returns @param errorMessage, used to remove() the first error message if the user fails again;
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
 * @function Array.prototype.push.apply pushes given data (response.transactions)
 * inside a given array (transactions, that was initialized as empty so now gets filled)
 * @function setTransactions (user-service.js file) requiring @param transactions
 * @function setBalance requiring @param transactions
 * I've also created a custom event to auto-reaload the background size (gradient):
 * @alert warns the user about not receiving any response from the API
  */
async function loadCurrentExpense(response){
    if(response){
        uService.setUserInfo(response.id);
        let userCategories = uService.userCategories;
        uService.setCategories(userCategories);
        Array.prototype.push.apply(transactions, response.transactions);
        uService.setTransactions(transactions);
        console.log("Starting transactions:", transactions);
        setBalance(transactions);
    } else {
        alert("No response from server");
    }
    isLoading(false);
}

/**
 * Function to set current user balance, takes the
 * @array transactions (= @param response.transactions)
 * and foreach transaction in the array, adds the "amount" value to balance
 * (@balance is initialized at zero), then replaces the total on the interface
 */
function setBalance(transactions){
    transactions.forEach(transaction => {
        balance += transaction.amount;
    });
    const balanceElement = document.getElementById("balance");
    balanceElement.innerText = balance.toFixed(2) + " €"; // toFixed(2) displays balance with 2 decimals
}

/**
 * Function to switch visible/hidden classes to the login section
 * and show user content, when user exists
 */
function toggleLogin() {
    loginContainerSelector.classList.remove("visible");
    loginContainerSelector.classList.add("hidden");
    appContainerSelector.classList.remove("hidden");
    appContainerSelector.classList.add("visible");
}

/* --------------------------------------------------------------------- */

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

/* --------------------------------------------------------------------- */


/**
 * Function to handle user click on "Add" button.
 * This function uses the updated @param response of the imported @object "current".
 * @param amount checks if incomeOption is true (leaves the amount as positive number)
 * or false (treats it as an expense, adds "-" to transform it into a negative number);
 * @param newTransaction stores the new transaction informations given by the user
 * (@param timestamp sends the current click time and date);
 * @function transactions.unshift() gets the global @array transactions and adds the new one (as first).
 * @param dataToSave recreates the API format ready for a POST request:
 * same user infos given by the GET request + updated local array of transactions.
 * @function saveData sends the POST request to the server
 * @function createTransaction (user-service.js) uses "newTransaction" data to add it to the interface
 * */ 
async function clickAddAmount(newDescription, newAmount, incomeOption) {
    isLoading(true);
    const amount = incomeOption ? Number(newAmount) : -Number(newAmount);
    const newTransaction = {
        description: newDescription,
        timestamp: new Date().toISOString(),
        amount: amount
    };
    transactions.unshift(newTransaction);

    current.dataToSave = {
        id : current.response.id,
        firstname : current.response.firstname,
        lastname: current.response.lastname,
        transactions: transactions
    };

    await saveData(url, current.dataToSave);
    uService.createTransaction(newTransaction);
    isLoading(false);
    alert(`${newTransaction.description} added`);
}

/**
 * Function to send a POST request. If the request succeds (200, ok) response in parsed in a json
 * and used to update the global @param response inside @object "current".
 * @function setBalance reloads balance amount only if POST is gone well, after being brought back to zero.
 */
async function saveData(url, dataToSave) {
    console.log("Saving data...");
    const promise = await fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSave)
        });

    if(promise.ok){
        current.response = await promise.json();
        console.log("New transactions:", current.response.transactions);

        balance = 0;
        setBalance(current.response.transactions);
        //TODO: reorder transactions automatically after adding one
        //uService.orderTransactions(current.response.transactions, current.orderBy)
    } else{
        alert("OPS! Request failed");
    }
}

/* --------------------------------------------------------------------- */

export default {
    transactions: transactions,
    url: url,
    isLoading:(show)=> isLoading(show),
    getUserData:(insertedId)=> getUserData(insertedId),
    showLoginError: showLoginError,
    loadCurrentExpense:(insertedId)=> loadCurrentExpense(insertedId),
    setBalance:(transactionData)=> setBalance(transactionData),
    toggleLogin: toggleLogin,

    createButton:(parent, innerText, classes)=> createButton(parent, innerText, classes),
    createInput:(parent, inputType, classes)=> createInput(parent, inputType, classes),

    clickAddAmount:(newAmount, newDescription, incomeOption)=> clickAddAmount(newAmount, newDescription, incomeOption),
    saveData:(url, dataToSave) => saveData(url, dataToSave)
}
