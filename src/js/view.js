//This file contains functions that define DOM Interactions for the app

import { domElements } from './base';
import { configureSubscription } from './pushmessage';

export const appView = (function () {
  
  //Private function to format numbers
  const formatNumber = function (num) {
    let numSplit, integer, decimal;

    //Make the number an absolute one i.e remove any sign, fixed to a decimal point of two
    num = Math.abs(num).toFixed(2);//returns a string
    //Spilt number into 2 parts, one for interger, the for the decimal part
    numSplit = num.split('.');
    //Assign the interger and decimal sides to variables. format integer to add commas
    integer = parseInt(numSplit[0]).toLocaleString();
    decimal = numSplit[1];
  
    return `${integer}.${decimal}`;
  };

  return {

    getInput: function () {
      //if viewport width is less than 520px, read data from the overlay form instead of the desktop form
      if (window.innerWidth <= 520) {
        return {
          inputType: domElements.overlayType.value,
          inputDescription: domElements.overlayDescription.value,
          inputValue: parseFloat(domElements.overlayValue.value)
        }
      } else {
        return {
          inputType: domElements.desktopType.value, //will return either 'expense' or 'income'.
          inputDescription: domElements.desktopDescription.value,
          inputValue: parseFloat(domElements.desktopValue.value)
        }

      }

    },

    //Publicly accessible method which accepts the resulting object; newItem and its type
    addItemToUI: async function (obj, type) {
      
      var newHtml, element;
      
      //Create html templates based on each input type i.e income or expenses
      const data = await obj
      if (type === 'income') {
        element = domElements.incomeList;
        newHtml = `<li id="${type}-${data.id}">
                    <span class="add_remove">&times</span>
                    <span class="add_description">${data.description}</span>
                    <span class="add_amount"> + ${formatNumber(data.value)}</span>
                  </li>`
        
      } else if (type === 'expense') {
        element = domElements.expenseList;
        newHtml = `<li id="${type}-${data.id}">
                    <span class="add_remove">&times</span>
                    <span class="add_description">${data.description}</span>
                    <span class="add_amount"> - ${formatNumber(data.value)}</span>
                    <span class="add_percentage">- %per%</span>
                  </li>`
      }

      //Insert newHtml to either an expense list or income list
      element.insertAdjacentHTML('afterbegin', newHtml);
    
    },

    //Calculate percentage for all expenses
    calculateAndDisplayPercentages: function(){
      
      let totalIncome = parseInt(localStorage.getItem('income'));
      console.log('totalincome :',totalIncome);
      
      //get all the lis in expenses ul
      let expenses = domElements.expenseList.getElementsByTagName('li');

      for(let i = 0; i < expenses.length; i++){

        //get string in span and remove spaces from the string
        let string = expenses[i].getElementsByTagName('span')[2].textContent.trim();
        let stringSplit = string.split(' ');
        let amount = parseInt(stringSplit[1].split(',').join(''));
        console.log(amount);
        let percentage;

        if (totalIncome > 0) {
          percentage = Math.round((amount / totalIncome) * 100);
        } else {
          percentage = 1;
        }
        
        expenses[i].getElementsByTagName('span')[3].textContent = `- ${percentage}%`;
      }
    },

    updateTotalsandBalance: function(input){
      let totalIncome
      //if input is income, calculate update total incomes
      if(input.inputType === 'income'){
        let income = parseInt(localStorage.getItem("income"));
        totalIncome = income + parseInt(input.inputValue);
        domElements.totalIncome.textContent = formatNumber(totalIncome);
        localStorage.setItem("income",totalIncome);

      //if input is expense, calculate update total expenses
      }else {
        let expense = parseInt(localStorage.getItem("expense"));
        let totalExpense = expense + parseInt(input.inputValue);
        domElements.totalExpense.textContent = formatNumber(totalExpense);
        localStorage.setItem("expense",totalExpense);
      }
       
       let totalExpenses = parseInt(localStorage.getItem("expense"));
       let totalIncomes = parseInt(localStorage.getItem("income"));
       let percentage;
       
       //Calculate, update and store balance in localstorage
       let balance = totalIncomes - totalExpenses;
       domElements.availableBalance.textContent = balance;
       localStorage.setItem("Balance", balance);
       
       //Determine and display sign
       balance > 0 ?  domElements.sign.textContent = '+' :  domElements.sign.textContent = '-';
      
       //Determine and display expense percentage
        if(totalIncomes > 0) {
          percentage = Math.round((totalExpenses / totalIncomes) * 100);
        } else {
          percentage = -1;
        }

        domElements.totalPercentage.textContent = `${percentage}%`;
        localStorage.setItem("Percentage", percentage);
    },

    loadIncomeFromIDB: function(){
      let newIncome
      readData('income').then(data => {
        if(data){
          for (var i = 0; i < data.length; i++) {
            newIncome = `<li id="income-${data[i].id}">
                <span class="add_remove">&times</span>
                <span class="add_description">${data[i].description}</span>
                <span class="add_amount"> + ${formatNumber(data[i].value)}</span>
              </li>`
  
            domElements.incomeList.insertAdjacentHTML('afterbegin', newIncome); 
          }
        }
      })
    },

    loadExpenseFromIDB: function(){
      readData('expense').then(data => {
        if(data){
          for (var i = 0; i < data.length; i++) {
            let newExpense = `<li id="expense-${data[i].id}">
                <span class="add_remove">&times</span>
                <span class="add_description">${data[i].description}</span>
                <span class="add_amount"> - ${formatNumber(data[i].value)}</span>
                <span class="add_percentage">- %per%</span>
              </li>`
            
            domElements.expenseList.insertAdjacentHTML('afterbegin', newExpense);
          }
        }
      })
    },

    loadTotalsFromLocalStorage: function (obj) {
     
      let sign;
      obj.balance > 0 ? sign = '+' : sign = '-';

      domElements.sign.textContent = sign;
      domElements.availableBalance.textContent = formatNumber(obj.balance);
      domElements.totalIncome.textContent = formatNumber(obj.totalIncome);
      domElements.totalExpense.textContent = formatNumber(obj.totalExpense);
      domElements.userCurrency.innerHTML = obj.userCurrency;

      obj.percentage > 0 ? domElements.totalPercentage.textContent = obj.percentage + '%' : domElements.totalPercentage.textContent = '--';
    
    },

    //Function to display the Mobile Form
    displayMobileForm: function () {
      domElements.overlay.style.visibility = "visible";
      domElements.overlayForm.style.visibility = "visible";
      domElements.overlayForm.style.height = "28rem";
    },

    //Function to close the Mobile Form and overlay
    removeOverlay: function () {
      domElements.overlay.style.visibility = "hidden";
      domElements.overlayForm.style.visibility = "hidden";
      domElements.overlayForm.style.height = "0";

    },

    //Display or Hide settings panel on click
    showSettingsBody: function () {
      domElements.settingsBody.classList.remove('hidden');
      domElements.settingsBody.classList.toggle('close');
      domElements.settingsBody.classList.toggle('open');
      domElements.settingsBodyContent.classList.toggle('hidden');

    },

    clearFormFields: function () {
      let formFields = [];

      if (window.innerWidth <= 520) {
        formFields = [domElements.overlayDescription, domElements.overlayValue]
        domElements.errMsgMobile.textContent = "";
      } else {
        formFields = [domElements.desktopDescription, domElements.desktopValue]
        domElements.errMsg.textContent = " ";
      }

      formFields.forEach(function (current) {
        current.value = " ";
        formFields[1].placeholder = 'Amount';
      })
    },

    displayDate: function () {
      let now, year, month, months;
      now = new Date();
      //get month
      month = now.getMonth();//returns an integer of a zero based array representing respective months
      months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      year = now.getFullYear();

      domElements.date.textContent = `${months[month]}, ${year}`;

    },

    //delete input item from ui
    deleteFromUI: (selectorID) => {
      document.getElementById(selectorID).remove();
    },

    setUserCurrency: () => {
      localStorage.setItem('userCurrency', domElements.selectCurrency.value);
      domElements.userCurrency.innerHTML = localStorage.getItem('userCurrency');
    },

    ifShowNotificationRadio: ()=> {
      let userNotificationChoice = localStorage.getItem('NotificationChoice');
      if('Notification' in window && userNotificationChoice === 'yes'){
        domElements.notifications.classList.add('hidden');
        domElements.notifications.classList.remove('notification');
      }
    },

    askForNotificationPermission : () => {
      Notification.requestPermission((result) => {
        if (result !== 'granted') {
          console.log('No notification permission granted!');
        } else {
          configureSubscription();
        }
      });
    }

  };

})();
