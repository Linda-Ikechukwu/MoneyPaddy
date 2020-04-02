import { domElements } from './base';
import { appModel } from './model';
import { appView } from './view';

//The Controller. Combines functions from the view and model
//----------------------------------------------------------
export const appController = (function (modelCtl, viewCtl) {

  //function contains all event listners to keep things organized.
  const setupEventListners = function () {
    //Add overlay and overlay form when mobile button is clicked
    domElements.addMobileButton.addEventListener('click', viewCtl.displayMobileForm);

    //Remove overlay and overlay form when overlay is clicked
    domElements.overlay.addEventListener('click', () => {
      viewCtl.removeOverlay();
      viewCtl.clearFormFields();
    });

    //Event listner for the desktop add key
    domElements.addBtnDesktop.addEventListener('click', addItemToUI);


    //close overlay form and add form contents to UI
    domElements.overlayFormAdd.addEventListener('click', addItemToUI);

    //event listener for the enter key
    document.addEventListener('keypress', (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        addItemToUI();
      }
    });

    //delete list 
    domElements.main.addEventListener('click', deleteFromUI);

    //show settings body on click
    domElements.settingsIcon.addEventListener('click', viewCtl.shSettingsBody);

    //update user currency symbol on click
    domElements.selectCurrency.addEventListener('change', viewCtl.setUserCurrency);

    //request notification permission if yes radio button is clicked
    domElements.notifyYes.addEventListener('click', () => {
      if (domElements.notifyYes.checked) {
        domElements.notifyYes.disabled = true;
        domElements.notifyNo.disabled = true;
        viewCtl.askForNotificationPermission();
      }
    })
  }

  const updateBalance = function () {
    //Calculate the balance
    modelCtl.calculateBalance();
    //Return the balance
    var balance = modelCtl.getBalance();
    //Display the balance on the UI
    viewCtl.displayBalance(balance);

  }

  const updatePercentages = function () {
    //calculate percentage
    modelCtl.calculatePercentages();

    //Read percentages from the budget controller
    var percentages = modelCtl.getPercentages();

    //Update UI with the new percentages
    viewCtl.displayPercentages(percentages);
  }

  //Function merges the activities of the uiController and budgetController to add elements to the UI
  const addItemToUI = function () {

    let input, newItem;

    //regular expression test to make sure inputs to description contain only letters
    const alphaExp = /^[a-zA-Z_ ]*$/;
    //Get new data object from the the input fields
    input = viewCtl.getInput();

    //check that input fields are not empty and correct data is entered.
    if (input.inputDescription.match(alphaExp) && input.inputDescription !== " " && !isNaN(input.inputValue) && input.inputValue > 0) {
      //clear error message
      domElements.errMsg.textContent = " ";
      domElements.errMsgMobile.textContent = " ";
      //Add new data object to the budget controller
      newItem = modelCtl.addToArray(input.inputType, input.inputDescription, input.inputValue)
      //add item to UI
      viewCtl.addItemToList(newItem, input.inputType);
      //clear form fields
      viewCtl.clearFormFields();
      //Calculte and dispaly balance
      updateBalance();
      //Calculate and update percentages
      updatePercentages();

    } else {
      if (window.innerWidth <= 520) {
        domElements.errMsgMobile.textContent = `*Please enter a description in just words and an amount in numbers greater than 0`;
      } else {
        domElements.errMsg.textContent = `*Please enter a description in just words and an amount in numbers greater than 0`;
      }

    }


  }

  const deleteFromUI = function (event) {
    var itemID, splitID, type, Id;
    //check if target of the event delegation on the main element is a delete button
    if (event.target.className === 'add_remove') {
      //get the id of the corresponding list and extract the type and ID
      itemID = event.target.parentNode.id;
      splitID = itemID.split('-');
      type = splitID[0];
      Id = parseInt(splitID[1]);

      //Delete the item from the data structure
      modelCtl.deleteItem(type, Id);

      //Delete item from the UI
      viewCtl.deletefromList(itemID);

      //Recalculate and update balance
      updateBalance();

      //Recalculate and update percentages
      updatePercentages();
    }
  },

  const clearUIOnLastDay = () => {

    let presentDay = new Date().getUTCDate();
    let presentMonth = new Date().getUTCMonth();
    let presentYear = new Date().getFullYear();
    let presentHour = new Date().getUTCHours();
    const lastday = new Date(presentYear, presentMonth + 1, 0).getDate();

    if (presentDay === lastday && presentHour === 23) {
      //Clear UI
      domElements.sign.textContent = ' ';
      domElements.availableBalance.textContent = '0';
      domElements.totalIncome.textContent ='0' ;
      domElements.totalExpense.textContent = '0';
      domElements.totalPercentage.textContent = '--';
      domElements.incomeList = " ";
      domElements.expenseList = " ";
      //Clear Data Object
      modelCtl.resetDataObject();
      //Clear IndexedDB
    }

  },

  return {
    init: function () {
      viewCtl.displayDate();
      viewCtl.getUserCurrency();
      viewCtl.showNotificationButton();
      setupEventListners();
      clearUIOnLastDay();
    }
  }

})(appModel, appView);


