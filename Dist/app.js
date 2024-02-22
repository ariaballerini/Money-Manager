import gService from "./global-service.js";
const loginInputSelector = document.getElementById("loginInput");
const loginButtonSelector = document.getElementById("loginButton");

let errorMessage = null;

console.log("Application started.")

/**
 * Event on clicking the "login" button
 * @param insertedId saves the input value
 * 
 * @function getUserData to check if a user exists:
 * if the API GET request returns any data (status:200, ok:true) proceeds with login
 * *and @returns the API response (const response = await promise.json);
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
    
    const response = await gService.getUserData(insertedId);
    if (response != null){
        await gService.loadCurrentExpense(response);
        gService.toggleLogin();
        console.log("Logged in!");
        return response;
    } else{
        loginInputSelector.value = "";
        errorMessage = gService.showLoginError();
        gService.isLoading(false);
        return;
    }
})

/** Other possible events on this */
gService.addButtonEvent();
gService.incomeOptionEvent();
gService.expenseOptionEvent();
