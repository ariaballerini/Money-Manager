import gService from "./global-service.js";
import { current } from "./app.js";
const transactionsContainer = document.getElementById("transactions");
let userInfo = {
    Id: null,
    Firstname: null,
    Lastname: null
};

//TODO: implement different categories for each userId
//TODO: add the category info when creating a new transaction
let userCategories = [
    "grocery",
    "health",
    "car",
    "shopping",
    "eatout" 
]

/* --------------------------------------------------------------------- */

/**
 * Function to recover user id and set firstname/lastname on the interface.
 * @param userId in this case is formatted as "firstname.lastname",
 * @function split splits it in 2 and updates the global @param userInfo;
 * @function capitalizeFirstLetter capitalizes firstname/lastname first letters.
 */
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

    function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

/**
 * Function to generate all user categories cards, takes global
 * @param userCategories and forech category creates one card;
 * @function createCategory actually creates the card as a button with an image
 * (note that the category name MUST equal the image name to match,
 * if they don't match the interface will show the loadingIcon as default).
 */
function setCategories(userCategories){
    const categoryList = document.getElementById("categoriesList");
    
    userCategories.forEach(category => {
        createCategory(category, categoryList);      
    });

    function createCategory(category, categoryList) {
        const categoryName = document.createElement("button");
        categoryName.classList.add("button", "categoryButton");
        
        const image = document.createElement("img");
        image.classList.add("categoryIcon");
        image.src = `./Assets/${category}.png`;
        image.onerror = function() {
            image.src = "./Assets/loadingIcon.svg";
        }
        
        categoryName.appendChild(image);
        categoryList.appendChild(categoryName);
    }
}

/**
 * Functions to set all transactions on the interface.
 * @function setTransactions takes the global @array of transactions,
 * orders them in @function orderTransactions and foreach transaction creates one section.
 * When creating the single transaction section, @function createTransaction
 * actually creates two other inner sections:
 * - one for real data with @function createTransactionDataSection;
 * - one for that section editing buttons with @function createEditTransactionSection.
 * @function createTransaction can be called also for one single transaction added.
 */
async function setTransactions(transactions){
    // transactions = response.transactions, is getting existing transactions
    // sorts transactions based on current orderBy option

    if (transactions !== null) {
        orderTransactions(transactions, current.orderBy);
        transactions.forEach(transactionData => {
            createTransaction(transactionData);
        });
    }
    else {
        console.log("No transactions to process");
    }
}

function orderTransactions(transactions, orderBy){
    if (orderBy === 'newest') {
        transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (orderBy === 'oldest') {
        transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (orderBy === 'description') {
        transactions.sort((a, b) => a.description.localeCompare(b.description));
    }
}

function createTransaction(transactionData){
    const transactionElement = document.createElement("div");
    transactionElement.classList.add("transaction");
    transactionsContainer.appendChild(transactionElement);

    const isPositive = transactionData.amount >= 0; // checks the transaction value
    const {dataRow, amount} = createTransactionDataSection(transactionData, transactionElement, isPositive);
    createEditTransactionSection(transactionData, transactionElement, dataRow, amount);
}

/**
 * This function splits the received @param transactionData into 3 inner sections:
 * @function setDescription to create a div for description
 * @function setDate to create a div for date
 * @function setAmount to create a div for amount
 * @param isPositive is used to visually add the "+" sign if the transaction is an income.
 * All these informations are specifically related to that @param transactionElement 
 * @returns @param dateRow and @param amount to use them for the edit button.
 */
function createTransactionDataSection(transactionData, transactionElement, isPositive){

    const dataRow = document.createElement("div");
    dataRow.classList.add("dataRow");
    transactionElement.appendChild(dataRow);

    setDescription();
    setDate();
    let amount = setAmount();
    
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

/**
 * This function creates a div (default hidden) with edit and delete buttons.
 * @function toggleTransaction on user click switches the section to visible (and viceversa),
 * @param transactionData and @param transactionElement are still used to refer to one specific transaction.
 * For @param dataRow and @param amount use see editButton.onclick. 
 */
function createEditTransactionSection(transactionData, transactionElement, dataRow, amount){
    const editTransactionSection = document.createElement("div"); // hidden section by default 
    transactionElement.appendChild(editTransactionSection);
    let changesHidden = true;
    let editButton;
    let deleteButton;
    
    let undoButton;
    let saveButton;
    let editInput;
    let currentValue;

    transactionElement.onclick = function() {
        toggleTransaction();

        // editButton.onclick = function() {
        //     editButton.remove();
        //     deleteButton.remove();

        //     //TODO: implement different inputs to edit description, date or amount
        //     editInput = gService.createInput(editTransactionSection, "number", ["form-control"]);
        //     currentValue = transactionData.amount;
        //     editInput.value = currentValue.innerText;

        //     undoButton = gService.createButton(editTransactionSection, "Undo", ["button", "editUndoButtons"]);
        //     saveButton = gService.createButton(editTransactionSection, "Save", ["button", "deleteSaveButtons"]);

        //     undoButton.onclick = function(){
        //         undoButton.remove();
        //         saveButton.remove();
        //         editButton = gService.createButton(editTransactionSection, "Edit", ["button", "editUndoButtons"]);
        //         deleteButton = gService.createButton(editTransactionSection, "Delete", ["button", "deleteSaveButtons"]);
        //     }

        //     saveButton.onclick = function(){
        //         const originalValue = transactionData.amount;
        //         const inputValue = editInput.value;
        //         if(inputValue.length === 0){
        //             editInput.classList.add("error");
        //             return;
        //         }
        //         editInput.classList.remove("error");
        //         originalValue = Number(inputValue);
        //         amount.innerText = originalValue >= 0 ? `+${originalValue}` : originalValue;
        //         editTransactionSection.classList.remove("visible");
        //         editTransactionSection.classList.add("hidden");
        //     }
        // };

        /**
         * Event listener when user clicks delete button on a single transaction.
         * @param transactionData comes from the creating process of this specific div element,
         * @function findIndex takes the current global array of transactions and finds the one matching,
         * @function splice gets the index of that transaction in the array and deletes it.
         * Then the new array is given to @param dataToSave that passes it to @function saveData.
         * If the POST request goes well, the element gets removed also from the interface,
         * otherwise console.log() prints an error.
         */
        deleteButton.onclick = async function() {
            const transactions = current.response.transactions;
            const index = transactions.findIndex(t => t === transactionData);
            if (index !== -1) {
                transactions.splice(index, 1);
            }

            current.dataToSave = {
                id : current.response.id,
                firstname : current.response.firstname,
                lastname: current.response.lastname,
                transactions: transactions
            };

            gService.isLoading(true);
            await gService.saveData(gService.url, current.dataToSave);
            transactionElement.remove();
            gService.isLoading(false);
            alert(`${transactionData.description} removed`);
        };
    };

    /**
     * Function to hide or show the edit section on a single transaction:
     * if @param changesHidden is true, eventually created edit/delete buttons are removed and section becomes hidden,
     * if @param changesHidden is false, creates edit/delete buttons and section becomes visible
     */
    function toggleTransaction(){
        if (changesHidden){
            changesHidden = false;
            editButton = gService.createButton(editTransactionSection, "Edit", ["button", "editUndoButtons"]);
            deleteButton = gService.createButton(editTransactionSection, "Delete", ["button", "deleteSaveButtons"]);
            editTransactionSection.classList.remove("hidden");
            editTransactionSection.classList.add("transactionActions", "visible");

        } else {
            changesHidden = true;
            if (editButton != null && deleteButton != null){
                editButton.remove();
                deleteButton.remove();
            }
            editTransactionSection.classList.add("hidden");
        }
    }
}

/* --------------------------------------------------------------------- */

export default {
    userCategories: userCategories,
    setUserInfo:(userId)=> setUserInfo(userId),
    setCategories:(userCategories)=> setCategories(userCategories),
    setTransactions:(transactions)=> setTransactions(transactions),
    orderTransactions:(transactions, orderBy)=> orderTransactions(transactions, orderBy),
    createTransaction:(transactionData)=> createTransaction(transactionData)
}