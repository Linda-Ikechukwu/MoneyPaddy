import { domElements } from './base';
import {configureSubscription} from './pushmessage';


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
    //if type of num is expense return - and the formatted number, else return +, then the formatted number
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
          inputType: document.domElements.desktopType.value, //will return either 'expense' or 'income'.
          inputDescription: domElements.desktopDescription.value,
          inputValue: parseFloat(domElements.desktopValue.value)
        }

      }

    },

    //Publicly accessible method which accepts the resulting object; newItem and its type
    addItemToList: function (obj, type) {
      var newHtml, element;
      //Create html templates based on each input type i.e income or expenses
      if (type === 'income') {
        element = domElements.incomeList;
        newHtml = `<li id="${type}-${obj.id}">
                    <span class="add_remove">&times</span>
                    <span class="add_description">${obj.description}</span>
                    <span class="add_amount"> + ${formatNumber(obj.value, type)}</span>
                  </li>`
      } else if (type === 'expense') {
        element = domElements.expenseList;
        newHtml = `<li id="${type}-${obj.id}">
                    <span class="add_remove">&times</span>
                    <span class="add_description">${obj.description}</span>
                    <span class="add_amount"> - ${formatNumber(obj.value, type)}</span>
                    <span class="add_percentage">- %per%</span>
                  </li>`
      }

      //Insert newHtml to either an expense list or income list
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
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
    shSettingsBody: function () {
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
      let type, sign;
      obj.balance > 0 ? type = 'income' : type = 'expense';
      type === 'income' ? sign = '+' : sign = '-';

      domElements.sign.textContent = sign;
      domElements.availableBalance.textContent = formatNumber(obj.balance);
      domElements.totalIncome.textContent = formatNumber(obj.totalIncome);
      domElements.totalExpense.textContent = formatNumber(obj.totalExpense);

      if (obj.percentage > 0) {
        domElements.totalPercentage.textContent = obj.percentage + '%';
      } else {
        domElements.totalPercentage.textContent = '--';
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

    deletefromList: (selectorID) => {
      document.getElementById(selectorID).remove();
    },

    setUserCurrency: () => {
      localStorage.setItem('userCurrency', domElements.selectCurrency.value);
      domElements.userCurrency.innerHTML = localStorage.getItem('userCurrency');
    },

    getUserCurrency: () => {
      if (localStorage.getItem('userCurrency')) {
        domElements.userCurrency.innerHTML = localStorage.getItem('userCurrency');
      }
      else {
        domElements.userCurrency.innerHTML = '&#8358;';
      }
    },

    showNotificationButton: () => {
      if('Notification' in window){
        domElements.notifications.classList.remove('hidden')
        domElements.notifications.classList.add('notification')
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