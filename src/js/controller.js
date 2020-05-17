
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
    domElements.addBtnDesktop.addEventListener('click', addInputandUpdateUI);

    //close overlay form and add form contents to UI
    domElements.overlayFormAdd.addEventListener('click', addInputandUpdateUI);

    //event listener for the enter key
    document.addEventListener('keypress', (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        addInputandUpdateUI();
      }
    });

    //delete list 
    domElements.main.addEventListener('click', deleteItem);

    //show settings body on click
    domElements.settingsIcon.addEventListener('click', viewCtl.showSettingsBody);

    //update user currency symbol on click
    domElements.selectCurrency.addEventListener('change', viewCtl.setUserCurrency);

    //request notification permission if yes radio button is clicked
    domElements.notifyYes.addEventListener('click', () => {
      if (domElements.notifyYes.checked) {
        localStorage.setItem('NotificationChoice', 'yes');
        domElements.notifyYes.disabled = true;
        domElements.notifyNo.disabled = true;
        viewCtl.askForNotificationPermission();
      }
    })
  }

  //function to sync expenses to firebase to store timestamp and enable push notifications.
  const syncExpenseData = function (input) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then(function (sw) {
          var post = {
            timestamp: Date.now(),
            value: input.inputValue,
            description: input.inputDescription
          };
          writeData('expenses-sync', post)
            .then(function () {
              return sw.sync.register('sync-new-inputs');
            })
            .catch(function (err) {
              console.log(err);
            });
        });
    } else {
      fetch('https://us-central1-money-paddy.cloudfunctions.net/syncExpenseData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          value: input.inputValue,
          description: input.inputDescription
        })
      })
        .then(function (res) {
          console.log('Sent data', res);
        })
    }
  }

  const addInputandUpdateUI = async function () {

    let input, newItem;

    //regular expression test to make sure inputs to description contain only letters
    const alphaExp = /^[a-zA-Z_ ]*$/;
    //Get new data object from the the input fields
    input = viewCtl.getInput();

    if (input.inputType === 'expense') {
      //Sync Expenses to firebase for push notification
      syncExpenseData(input);
    }

    //check that input fields are not empty and correct data is entered.
    if (input.inputDescription.match(alphaExp) && input.inputDescription !== " " && !isNaN(input.inputValue) && input.inputValue > 0) {
      //clear error message
      domElements.errMsg.textContent = " ";
      domElements.errMsgMobile.textContent = " ";
      //Add new data object to the budget controller
      newItem = modelCtl.addToDB(input.inputType, input.inputDescription, input.inputValue);

      //clear form fields
      viewCtl.clearFormFields();

      //add item to UI
      await viewCtl.addItemToUI(newItem, input.inputType);

      //update totals and balances
      viewCtl.updateTotalsandBalance(input);

      //update expenses percentages
      viewCtl.calculateAndDisplayPercentages()



    } else {
      if (window.innerWidth <= 520) {
        domElements.errMsgMobile.textContent = `*Please enter a description in just words and an amount in numbers greater than 0`;
      } else {
        domElements.errMsg.textContent = `*Please enter a description in just words and an amount in numbers greater than 0`;
      }

    }


  }



  const deleteItem = async function (event) {
    var itemID, splitID, type, Id;
    //check if target of the event delegation on the main element is a delete button
    if (event.target.className === 'add_remove') {
      //get the id of the corresponding list and extract the type and ID
      itemID = event.target.parentNode.id;
      splitID = itemID.split('-');
      type = splitID[0];
      Id = parseInt(splitID[1]);

      //Delete the item from the data structure
      modelCtl.deleteFromDB(type, Id);

      //Delete item from the UI
      viewCtl.deleteFromUI(itemID);

      //Calculate the balance
      await modelCtl.reCalculateBalance();

      //Return the balance
      let balance = modelCtl.getBalance();

      //Display the balance on the UI
      viewCtl.loadTotalsFromLocalStorage(balance);

      //Recalculate and update expense percentages
      viewCtl.calculateAndDisplayPercentages();
    }
  }

  //Persist Data from Indexeddb and local storage on page reload
  const loadUIFromDB = function () {

    viewCtl.displayDate();
    modelCtl.initializeLocalStorage();
    let balance = modelCtl.getBalance();
    viewCtl.loadTotalsFromLocalStorage(balance);
    viewCtl.loadIncomeFromIDB();
    viewCtl.loadExpenseFromIDB();
    viewCtl.ifShowNotificationRadio();

  }


  const clearUIOnLastDayOfMonth = async () => {

    let presentDay = new Date().getUTCDate();
    let presentMonth = new Date().getUTCMonth();
    let presentYear = new Date().getFullYear();
    let presentHour = new Date().getUTCHours();
    const lastday = new Date(presentYear, presentMonth + 1, 0).getDate();

    if (presentDay === lastday && presentHour === 23) {
      //Clear UI
      domElements.sign.textContent = ' ';
      domElements.availableBalance.textContent = '0';
      domElements.totalIncome.textContent = '0';
      domElements.totalExpense.textContent = '0';
      domElements.totalPercentage.textContent = '--';
      domElements.incomeList = " ";
      domElements.expenseList = " ";
      //Clear Local Storage
      modelCtl.resetLocalStorage();
      //Clear IndexedDBs
      await clearDatabase('expense');
      await clearDatabase('income');
      await clearDatabase('expenses-sync');

    }else{
      console.log("Not the end of the month yet ")
    }



  }

  return {
    init: async function () {
      await clearUIOnLastDayOfMonth();
      loadUIFromDB();
      setupEventListners();

      //Making sure that the expense ul has been loaded to the DOM before calculating percentages,
      const checkForExpenses = setInterval(function () {
        if (domElements.expenseList.childElementCount >= 1) {
          viewCtl.calculateAndDisplayPercentages()
          clearInterval(checkForExpenses);
        }
      }, 100);

    }
  }

})(appModel, appView);


