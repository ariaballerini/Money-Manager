import gService from "./global-service.js";
const loginInputSelector = document.getElementById("loginInput");
const loginButtonSelector = document.getElementById("loginButton");
const incomeOptionSelector = document.getElementById("incomeToggle");
const expenseOptionSelector = document.getElementById("expenseToggle");
const addButtonSelector = document.getElementById("addButton");
const addInputSelector = document.getElementById("addInput");
const addDescriptionInputSelector = document.getElementById("addDescriptionInput");
const appContainerSelector = document.getElementById("appContainer");

let errorMessage = null;
let incomeOption = true;

/** Note for me: in JavaScript, when importing a variable, you obtain just a copy of its value.
 * If the value of that variable changes in the original file, the imported copy doesn't update.
 * Instead, when you're using "current.response" you're actually creating a "container", an object,
 * since objects and arrays are imported as memory references (and not as a copy of their value!),
 * when you update "current.response" in one file, you're changing a property of the object.
 * Changes will be available all over your project files that import "current" object e.g. gService.
 *  */
export let current = {
    response: null,
    orderBy : "newest",
    dataToSave: {}
};

/* --------------------------------------------------------------------- */

/**
 * Event listener when user clicks the "login" button.
 * @param insertedId saves the input value
 * @function getUserData to check if a user exists:
 * if the API GET request returns any data (status:200, ok:true) proceeds with login
 * *and @returns the API response (current.response = await promise.json), saved as global;
 * if the API GET doesn't respond (404, false), getUserData shows an error.
 */
loginButtonSelector.addEventListener("click", async function() {
    if (errorMessage != null){
        errorMessage.remove();
    }

    gService.isLoading(true);
    let insertedId = loginInputSelector.value;
    while(insertedId.length === 0) {
        gService.isLoading(false);
        loginInputSelector.classList.add("error");
        return;
    } loginInputSelector.classList.remove("error");
    
    current.response = await gService.getUserData(insertedId);

    if (current.response != null){
        console.log("Logged in!");
        await gService.loadCurrentExpense(current.response);
        gService.toggleLogin();
        // return current.response;
    } else {
        loginInputSelector.value = "";
        errorMessage = gService.showLoginError();
        gService.isLoading(false);
        return;
    }
})

/**
 * Event listeners when user clicks the "income" button (default) or the "expense" one,
 * both directly handle the application behaviour, switching to one another.
 */
incomeOptionSelector.addEventListener("click", function() {
    incomeOption = true;
    incomeOptionSelector.classList.remove("notSelected");
    expenseOptionSelector.classList.add("notSelected");
    })

expenseOptionSelector.addEventListener("click", function() {
    incomeOption = false;
    expenseOptionSelector.classList.remove("notSelected");
    incomeOptionSelector.classList.add("notSelected");
})

/**
 * Event listener when user clicks the add button, both for and expense or an income.
 * @param newDescription saves the new user input value (description)
 * @param newAmount saves the new user input value (amount), checks that's not empty
 * @function clickAddAmount handles the application behaviour at the event
 * (both input values turn back empty after being passed to that function)
 */
addButtonSelector.addEventListener("click", function() {
    let newDescription = addDescriptionInputSelector.value;
    let newAmount = addInputSelector.value;
    while(newAmount.length === 0) {
        addInputSelector.classList.add("error");
        return;
    } addInputSelector.classList.remove("error");
    gService.clickAddAmount(newDescription, newAmount, incomeOption);

    addInputSelector.value = "";
    addDescriptionInputSelector.value = "";
});

/**
 * Customized event to reload background-size when content changes
 * (the user has added or removed objects from the interface).
 * @param scrollHeight defines the new size of the background
 * @function setTimeout with "1" delays the event in 1s
 *  */
export const contentChangeEvent = new Event("contentChanged");
appContainerSelector.addEventListener("contentChanged", function() {
    var gradientBackground = document.querySelector(".gradient-background");
    setTimeout(function() {
        gradientBackground.style.height = appContainerSelector.scrollHeight + "px";
    }, 1);
});

/**
 * @event contentChangeEvent gets dispatched whenever window-size changes.
 */
window.addEventListener('resize', function() {
    appContainerSelector.dispatchEvent(contentChangeEvent);
});

//TODO: implement event listener when clicking "retun to homepage" button
//TODO: implement event listener when choosing an option from select "Order by"