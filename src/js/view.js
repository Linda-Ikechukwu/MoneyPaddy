import { domElements } from './base';
import { configureSubscription } from './pushmessage';
// import {} from './lib/indexeddb'




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
        console.log(obj, type);
        element = domElements.incomeList;
        newHtml = `<li id="${type}-${data.id}">
                    <span class="add_remove">&times</span>
                    <span class="add_description">${data.description}</span>
                    <span class="add_amount"> + ${formatNumber(data.value)}</span>
                  </li>`
        
      } else if (type === 'expense') {
        element = domElements.expenseList;
        console.log(obj, type);
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

    calculateAndDisplayPercentages: function(){
      let totalIncome = parseInt(localStorage.getItem('income'));
      //get all the lis in expenses ul
      let expenses = domElements.expenseList.getElementsByTagName('li');

      for(let i = 0; i < expenses.length; i++){
        let string = expenses[i].getElementsByTagName('span')[2].textContent.trim();
        let stringSplit = string.split(' ');
        let amount = parseInt(stringSplit[1]);
        let percentage = 0;

        if (totalIncome > 0) {
          percentage = Math.round((amount / totalIncome) * 100);
        } else {
          percentage = -1;
        }
        
        expenses[i].getElementsByTagName('span')[3].textContent = percentage;
      }
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

    displayBalance: function (obj) {
      //Check if respective localstorages exist, then read data
      if((localStorage.hasOwnProperty('Balance')) && (localStorage.hasOwnProperty('income')) && (localStorage.hasOwnProperty('expense')) && (localStorage.hasOwnProperty('Percentage'))){
        let sign;
        obj.balance > 0 ? sign = '+' : sign = '-';
  
        domElements.sign.textContent = sign;
        domElements.availableBalance.textContent = formatNumber(obj.balance);
        domElements.totalIncome.textContent = formatNumber(obj.totalIncome);
        domElements.totalExpense.textContent = formatNumber(obj.totalExpense);
  
        obj.percentage > 0 ? domElements.totalPercentage.textContent = obj.percentage + '%' : domElements.totalPercentage.textContent = '--';
      
      }else{
        domElements.sign.textContent = ' ';
        domElements.availableBalance.textContent = '0';
        domElements.totalIncome.textContent = '0';
        domElements.totalExpense.textContent = '0';
      }
      
      

    },

    displayPercentages: function (percentages) {
      let fields;

      //Select all expense percentages span and convert the nodelist to an array
      fields = Array.from(domElements.percentages);

      //Call the nodelistforeaach function to loop through the fields nodestring
      fields.forEach((field, index) => {
        if (percentages[index] > 0) {
          field.textContent = `- ${percentages[index]}%`;
        } else {
          field.textContent = `--`;
        }
      }
      );

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

    deleteFromUI: (selectorID) => {
      document.getElementById(selectorID).remove();
    },

    setUserCurrency: () => {
      localStorage.setItem('userCurrency', domElements.selectCurrency.value);
      domElements.userCurrency.innerHTML = localStorage.getItem('userCurrency');
    },

    getUserCurrency: () => {
      if (localStorage.hasOwnProperty('userCurrency')) {
        domElements.userCurrency.innerHTML = localStorage.getItem('userCurrency');
      }
      else {
        domElements.userCurrency.innerHTML = '&#8358;';
      }
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
