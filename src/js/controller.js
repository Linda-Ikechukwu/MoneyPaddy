import { domElements } from './base';
import { budgetModel } from './model';
import { budgetView } from './view';

//The Controller. Combines functions from the view and model
//----------------------------------------------------------
export const budgetController = (function (budgetCtl, uiCtl) {

  //function contains all event listners to keep things organized.
  const setupEventListners = function () {
    //Add overlay and overlay form when mobile button is clicked
    document.querySelector(domElements.addMobileButton).addEventListener('click', uiCtl.displayMobileForm);

    //Remove overlay and overlay form when overlay is clicked
    document.querySelector(domElements.overlay).addEventListener('click', () => {
      uiCtl.removeOverlay();
      uiCtl.clearFormFields();
    });

    //Event listner for the desktop add key
    document.querySelector(domElements.addBtnDesktop).addEventListener('click', addItemToUI);


    //close overlay form and add form contents to UI
    document.querySelector(domElements.overlayFormAdd).addEventListener('click', addItemToUI);

    //event listener for the enter key
    document.addEventListener('keypress', (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        addItemToUI();
      }
    });

    //delete list 
    document.querySelector(domElements.main).addEventListener('click', deleteFromUI);

    //show settings body on click
    document.querySelector(domElements.settingsIcon).addEventListener('click', uiCtl.shSettingsBody);

    //update user currency symbol on click
    document.querySelector(domElements.selectCurrency).addEventListener('change', uiCtl.setUserCurrency);
  }

  const updateBalance = function () {
    //Calculate the balance
    budgetCtl.calculateBalance();
    //Return the balance
    var balance = budgetCtl.getBalance();
    //Display the balance on the UI
    uiCtl.displayBalance(balance);

  }

  const updatePercentages = function () {
    //calculate percentage
    budgetCtl.calcualtePercentages();

    //Read percentages from the budget controller
    var percentages = budgetCtl.getPercentages();

    //Update UI with the new percentages
    uiCtl.displayPercentages(percentages);
  }

 //Function merges the activities of the uiController and budgetController to add elements to the UI
  const addItemToUI = function () {

    //Check if app is installed and alert user to install
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }else{
      alert('This app works better when installed. Add to Home Screen from browser menu');
    }

    let input, newItem;

    //regular expression test to make sure inputs to description contain only letters
    const alphaExp = /^[a-zA-Z_ ]*$/;
    //Get new data object from the the input fields
    input = uiCtl.getInput();

    //check that input fields are not empty and correct data is entered.
    if (input.inputDescription.match(alphaExp) && input.inputDescription !== " " &&  !isNaN(input.inputValue) && input.inputValue > 0) {
      //clear error message
      document.querySelector(domElements.errMsg).textContent = " ";
      document.querySelector(domElements.errMsgMobile).textContent = " ";
      //Add new data object to the budget controller
      newItem = budgetCtl.addItem(input.inputType, input.inputDescription, input.inputValue)
      //add item to UI
      uiCtl.addItemToList(newItem, input.inputType);
      //clear form fields
      uiCtl.clearFormFields();
      //Calculte and dispaly balance
      updateBalance();
      //Calculate and update percentages
      updatePercentages();

    } else {
      if (window.innerWidth <= 520) {
        document.querySelector(domElements.errMsgMobile).textContent = `*Please enter a description in just words and an amount in numbers greater than 0`;
      } else {
        document.querySelector(domElements.errMsg).textContent = `*Please enter a description in just words and an amount in numbers greater than 0`;
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
      budgetCtl.deleteItem(type, Id);

      //Delete item from the UI
      uiCtl.deletefromList(itemID);

      //Recalculate and update balance
      updateBalance();

      //Recalculate and update percentages
      updatePercentages();
    }
  }

  return {
    init: function () {
      uiCtl.displayDate();
      uiCtl.getUserCurrency();
      setupEventListners();
    }
  }

})(budgetModel, budgetView);


