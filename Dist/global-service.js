import uService from "./user-service.js";

const url = "https://demo-corso-commit.acm-e.com/api/moneyTransactions";
let loginId = "/arianna.ballerini";
let dataToSave = {};
let incomeOption = true;
const transactions = [];

async function getUserData(){
    const promise = await fetch(url + loginId,{
    method:'GET'
    });

    if(promise){
        const response = await promise.json();
        Array.prototype.push.apply(transactions, response.transactions);
        setBalance(transactions);
        return response;
    }
    return null;
}

async function saveData(url, dataToSave) {
    console.log("inside saveData:")
    console.log(dataToSave);
    try {
        const response = await fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
            console.log(response);
        }
        const jsonData = await response.json();
        console.log("Post done!");
        console.log(jsonData);
        setBalance(jsonData.transactions);
        return jsonData;
    } catch (error) {
        console.error(error);
    }
}

function isLoading(show){
    if(show){
        const layer = document.createElement("div");
        layer.classList.add("loadingLayer");
        layer.id = "loading";
        document.body.appendChild(layer);

        const loadingIcon = document.createElement("img");
        loadingIcon.src = "./Assets/loadingIcon.svg";
        layer.appendChild(loadingIcon);
        return;
    }

    const layer = document.getElementById("loading");
    layer.remove();
}

function setBalance(transactions){ // expects an array of transactions
    let balance = 0; // initial balance always starts from 0
    console.log("Current transactions:")
    console.log(transactions);
    transactions.forEach(transaction => {
        balance += transaction.amount;
    });
    const balanceElement = document.getElementById("balance");
    balanceElement.innerText = balance.toFixed(2) + " €"; // toFixed(2) displays balance with 2 decimals
}

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

/* selectors */
const addButtonSelector = document.getElementById("addButton");
const addInputSelector = document.getElementById("addInput");
const addDescriptionInputSelector = document.getElementById("addDescriptionInput");
const incomeOptionSelector = document.getElementById("incomeToggle");
const expenseOptionSelector = document.getElementById("expenseToggle");

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
        userInfo: uService.userInfo,
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


export default {
    transactions: transactions,
    getUserData: getUserData,
    saveData:(url, data = {})=> saveData(url, data = {}),
    isLoading:(show)=> isLoading(show),
    handleNewTransaction:(data)=> handleNewTransaction(data),
    setBalance:(transactionData)=> setBalance(transactionData),
    createButton:(parent, innerText, classes)=> createButton(parent, innerText, classes),
    createInput:(parent, inputType, classes)=> createInput(parent, inputType, classes),
    url: url,
    addButtonEvent: addButtonEvent,
    incomeOptionEvent: incomeOptionEvent,
    expenseOptionEvent: expenseOptionEvent
}
