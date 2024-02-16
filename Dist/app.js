import gService from "./global-service.js";
import uService from "./user-service.js";

/* start recovering all data */
loadCurrentExpense();

async function loadCurrentExpense(){
    gService.isLoading(true);
    const response = await gService.getUserData();

    if(response){
        uService.setUserInfo(response.id);
        let userCategories = uService.userCategories;
        uService.setCategories(userCategories);
        uService.setTransactions(response.transactions);
    } else {
        console.log("no response");
    }
    gService.isLoading(false);
}

/* possible events */
gService.addButtonEvent();
gService.incomeOptionEvent();
gService.expenseOptionEvent();




