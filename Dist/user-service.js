import gService from "./global-service.js";

const transactionsContainer = document.getElementById("transactions");
let userInfo = { // global variable to host user info
    Id: null,
    Firstname: null,
    Lastname: null
};
 
let userCategories = [
    "grocery",
    "health",
    "car",
    "shopping",
    "eatout" 
] //TODO: implement different categories for each userId


/* function to recover user id and set firstname/lastname */
function setUserInfo(userId){

    const [userFirstname, userLastname] = userId.split('.');

    userInfo = { // updating user info
        Id: userId,
        Firstname: capitalizeFirstLetter(userFirstname),
        Lastname: capitalizeFirstLetter(userLastname)
    };

    const name = document.getElementById("user-firstname");
    name.innerText = capitalizeFirstLetter(userFirstname);

    const lastname = document.getElementById("user-lastname");
    lastname.innerText = capitalizeFirstLetter(userLastname);

    /* function to capitalize firstname/lastname first letters */
    function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

/* function to set all user categories */
function setCategories(userCategories){
    const categoryList = document.getElementById("categoriesList");
    
    userCategories.forEach(category => {
        createCategory(category, categoryList);      
    });

    /* function to create a category */
    function createCategory(category, categoryList) {
        const categoryName = document.createElement("button");
        categoryName.classList.add("button", "categoryButton");
        
        const image = document.createElement("img");
        image.classList.add("categoryIcon");
        image.src = `./Assets/${category}.png`;
        image.onerror = function() {
            image.src = "./Assets/loadingIcon.svg"; // default icon
        }
        
        categoryName.appendChild(image);  // adds the icon to the button
        categoryList.appendChild(categoryName); // adds the button to the list
    }
}

/* function to recover all transactions */
async function setTransactions(transactions, orderBy = "newest"){
    // transactions = response.transactions, is getting existing transactions
    // sorts transactions based on orderBy option

    if (transactions !== null) {
        if (orderBy === 'newest') {
            transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (orderBy === 'oldest') {
            transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        } else if (orderBy === 'description') {
            transactions.sort((a, b) => a.description.localeCompare(b.description));
        }

        transactions.forEach(transactionData => {
            createTransaction(transactionData);
        });
    }
    else {
        console.log("No transactions to process");
    }
}

/* functions to create a unique transaction */
function createTransaction(transactionData){
    const transactionElement = document.createElement("div");
    transactionElement.classList.add("transaction");
    transactionsContainer.appendChild(transactionElement);

    const isPositive = transactionData.amount >= 0; // checks the transaction value
    const {dataRow, amount} = createTransactionDataSection(transactionData, transactionElement, isPositive);
    createEditTransactionSection(transactionData, transactionElement, dataRow, amount);
}

function createTransactionDataSection(transactionData, transactionElement, isPositive){

    const dataRow = document.createElement("div");
    dataRow.classList.add("dataRow");
    transactionElement.appendChild(dataRow);

    setDescription();
    setDate();
    let amount = setAmount();
    
    /* functions to set (that) transaction description, date and amount*/
    function setDescription(){
        const description = document.createElement("div");
        description.classList.add("description");
        description.classList.add(isPositive ? "positive" : "negative");
        description.innerText = transactionData.description;
        dataRow.appendChild(description);
    }

    function setDate(){
        const date = document.createElement("div");
        date.classList.add("date");
        date.classList.add(isPositive ? "positive" : "negative");
        date.innerText = new Date(transactionData.timestamp).toLocaleDateString();
        dataRow.appendChild(date);
    }

    function setAmount(){
        const amount = document.createElement("div");
        amount.classList.add("amount");
        amount.classList.add(isPositive ? "positive" : "negative");
        amount.innerText = transactionData.amount >= 0 ? `+${transactionData.amount}` : transactionData.amount;
        dataRow.appendChild(amount);
    }
    
    return {dataRow, amount};
}

function createEditTransactionSection(transactionData, transactionElement, dataRow, amount){
    const editTransactionSection = document.createElement("div"); // hidden section by default
    editTransactionSection.classList.add("hidden"); 
    transactionElement.appendChild(editTransactionSection);

    let editButton;
    let deleteButton;
    let undoButton;
    let saveButton;
    let editInput;
    let currentValue;

    transactionElement.onclick = function() {
        editTransactionSection.classList.remove("hidden");
        editTransactionSection.classList.add("visible"); // shows section on click
        editButton = gService.createButton(editTransactionSection, "Edit", ["button", "editUndoButtons"]);
        deleteButton = gService.createButton(editTransactionSection, "Delete", ["button", "deleteSaveButtons"]);

        /* events on edit transaction buttons*/
        editButton.onclick = function() {
            editButton.remove();
            deleteButton.remove();

            //TODO: implement different inputs to edit description, date or amount
            editInput = gService.createInput(editTransactionSection, "number", ["form-control"]);
            currentValue = transactionData.amount;
            editInput.value = currentValue.innerText;

            undoButton = gService.createButton(editTransactionSection, "Undo", ["button", "editUndoButtons"]);
            saveButton = gService.createButton(editTransactionSection, "Save", ["button", "deleteSaveButtons"]);

            undoButton.onclick = function(){
                undoButton.remove();
                saveButton.remove();
                editButton = gService.createButton(editTransactionSection, "Edit", ["button", "editUndoButtons"]);
                deleteButton = gService.createButton(editTransactionSection, "Delete", ["button", "deleteSaveButtons"]);
            }

            saveButton.onclick = function(){
                const originalValue = transactionData.amount;
                const inputValue = editInput.value;
                if(inputValue.length === 0){
                    editInput.classList.add("error");
                    return;
                }
                editInput.classList.remove("error");
                originalValue = Number(inputValue);
                amount.innerText = originalValue >= 0 ? `+${originalValue}` : originalValue;
                editTransactionSection.classList.remove("visible");
                editTransactionSection.classList.add("hidden");
            }
        };

        deleteButton.onclick = function() {
            transactionElement.remove();
            saveData();
        };
    };
}


export default {
    setUserInfo:(userId)=> setUserInfo(userId),
    capitalizeFirstLetter:(string)=> capitalizeFirstLetter(string),
    setCategories:(userCategories)=> setCategories(userCategories),
    createCategory:(category, categoryList)=> createCategory(category, categoryList),
    userCategories: userCategories,
    userInfo: userInfo,

    setTransactions:(userTransactions, orderBy = "newest")=> setTransactions(userTransactions, orderBy = "newest"),
    clickAddAmount:(newAmount, newDescription, incomeOption)=> clickAddAmount(newAmount, newDescription, incomeOption),
    createTransaction:(transactionData)=> createTransaction(transactionData),
    setDescription:(transactionData, transactionElement, isPositive)=> setDescription(transactionData, transactionElement, isPositive),
    setDate:(transactionData, transactionElement, isPositive)=> setDate(transactionData, transactionElement, isPositive),
    setAmount:(transactionData, transactionElement, isPositive)=> setAmount(transactionData, transactionElement, isPositive),
    setBalance:(amount)=> setBalance(amount),
    createShowDetailsButton:(transactionButtons)=> createShowDetailsButton(transactionButtons),
    createEditButton:(transactionButtons)=> createEditButton(transactionButtons),
    createRemoveButton:(transactionButtons)=> createRemoveButton(transactionButtons),
}