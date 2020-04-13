
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
    domElements.addBtnDesktop.addEventListener('click', addItem);


    //close overlay form and add form contents to UI
    domElements.overlayFormAdd.addEventListener('click', addItem);

    //event listener for the enter key
    document.addEventListener('keypress', (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        addItem();
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

  //function to sync posts to firebase to store timestamp and enable push notifications.
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

  const updateBalance = function () {
    //Calculate the balance
    modelCtl.calculateBalance();
    //Return the balance
    let balance = modelCtl.getBalance();
    //Display the balance on the UI
    viewCtl.displayBalance(balance);

  }

  const addItem = function () {

    let input, newItem;

    //regular expression test to make sure inputs to description contain only letters
    const alphaExp = /^[a-zA-Z_ ]*$/;
    //Get new data object from the the input fields
    input = viewCtl.getInput();

    if(input.inputType === 'expense'){
      syncExpenseData(input);
    }

    //check that input fields are not empty and correct data is entered.
    if (input.inputDescription.match(alphaExp) && input.inputDescription !== " " && !isNaN(input.inputValue) && input.inputValue > 0) {
      //clear error message
      domElements.errMsg.textContent = " ";
      domElements.errMsgMobile.textContent = " ";
      //Add new data object to the budget controller
      newItem = modelCtl.addToDB(input.inputType, input.inputDescription, input.inputValue);
      console.log(input.inputType);
      //clear form fields
      viewCtl.clearFormFields();
      //add item to UI
      viewCtl.addItemToUI(newItem, input.inputType);
      //Calculte and dispaly balance
      updateBalance();
      //Update Percentages
      viewCtl.calculateAndDisplayPercentages();
      

    } else {
      if (window.innerWidth <= 520) {
        domElements.errMsgMobile.textContent = `*Please enter a description in just words and an amount in numbers greater than 0`;
      } else {
        domElements.errMsg.textContent = `*Please enter a description in just words and an amount in numbers greater than 0`;
      }

    }


  }

  const deleteItem = function (event) {
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

      //Recalculate and update balance
      updateBalance();

      //Recalculate and update percentages
      updatePercentages();
    }
  }

  //Persist Data from Indexeddb and local storage on page reload
  const loadUIFromDB = function(){
    viewCtl.displayDate();
    viewCtl.getUserCurrency();
    let balance = modelCtl.getBalance();
    console.log(balance);
    viewCtl.displayBalance(balance);
    viewCtl.loadIncomeFromIDB();
    viewCtl.loadExpenseFromIDB();
    //updatePercentages();
    viewCtl.ifShowNotificationRadio();
  }


  const clearUIOnLastDayOfMonth = () => {

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
      clearDatabase('expense');
      clearDatabase('income');
      clearDatabase('expenses-sync');


    }

  }

  return {
    init: function () {
      loadUIFromDB();
      setupEventListners();
      clearUIOnLastDayOfMonth();
      
      //Making sure that the expense ul has been loaded to the DOM,
      window.addEventListener('load', () =>{
        let i = setInterval(function (){
          if(domElements.expenseList.getElementsByTagName('li').length >= 1){
            clearInterval(i);
            viewCtl.calculateAndDisplayPercentages();
          }
        },200)
      } )
      
    }
  }

})(appModel, appView);


