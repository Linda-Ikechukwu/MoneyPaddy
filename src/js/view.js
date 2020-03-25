import { domElements } from './base';


export const budgetView = (function () {
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
          inputType: document.querySelector(domElements.overlayType).value,
          inputDescription: document.querySelector(domElements.overlayDescription).value,
          inputValue: parseFloat(document.querySelector(domElements.overlayValue).value)
        }
      } else {
        return {
          inputType: document.querySelector(domElements.desktopType).value, //will return either 'expense' or 'income'.
          inputDescription: document.querySelector(domElements.desktopDescription).value,
          inputValue: parseFloat(document.querySelector(domElements.desktopValue).value)
        }

      }

    },

    //Publicly accessible method which accepts the resulting object; newItem and its type
    addItemToList: function (obj, type) {
      var newHtml, element, sign;
      //Create html templates based on each input type i.e income or expenses
      if (type === 'income') {
        element = domElements.incomeList;
        sign = '+'
        newHtml = `<li id="${obj.id}"><span class="add_remove">&times</span><span class="add_description">${obj.description}</span><span class="add_amount${sign} ${formatNumber(obj.value, type)}</span></li>`
      } else if (type === 'expense') {
        element = domElements.expenseList;
        sign = '-'
        newHtml = `<li id="${obj.id}"><span class="add_remove">&times</span><span class="add_description">${obj.description}</span><span class="add_amount">${sign} ${formatNumber(obj.value, type)}</span><span class="add_percentage">- %per%</span></li>`
      }

      //Insert newHtml to either an expense list or income list
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    //Function to display the Mobile Form
    displayMobileForm: function () {
      document.querySelector(domElements.overlay).style.visibility = "visible";
      document.querySelector(domElements.overlayForm).style.visibility = "visible";
      document.querySelector(domElements.overlayForm).style.height = "28rem";
    },

    //Function to close the Mobile Form and overlay
    removeOverlay: function () {
      document.querySelector(domElements.overlay).style.visibility = "hidden";
      document.querySelector(domElements.overlayForm).style.visibility = "hidden";
      document.querySelector(domElements.overlayForm).style.height = "0";

    },

    //Display or Hide settings panel on click
    shSettingsBody: function () {
      document.querySelector(domElements.settingsBody).classList.remove('hidden');
      document.querySelector(domElements.settingsBody).classList.toggle('close');
      document.querySelector(domElements.settingsBody).classList.toggle('open');
      document.querySelector(domElements.settingsBodyContent).classList.toggle('hidden');

    },

    clearFormFields: function () {
      let formFields = [];

      if (window.innerWidth <= 520) {
        formFields = [document.querySelector(domElements.overlayDescription), document.querySelector(domElements.overlayValue)]
      } else {
        formFields = [document.querySelector(domElements.desktopDescription), document.querySelector(domElements.desktopValue)]
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

      document.querySelector(domElements.sign).textContent = sign;
      document.querySelector(domElements.availableBalance).textContent = formatNumber(obj.balance);
      document.querySelector(domElements.totalIncome).textContent = formatNumber(obj.totalIncome);
      document.querySelector(domElements.totalExpense).textContent = formatNumber(obj.totalExpense);

      if (obj.percentage > 0) {
        document.querySelector(domElements.totalPercentage).textContent = obj.percentage + '%';
      } else {
        document.querySelector(domElements.totalPercentage).textContent = '--';
      }

    },

    displayPercentages: function (percentages) {
      let fields;

      //Select all expense percentages span and convert the nodelist to an array
      fields = Array.from(document.querySelectorAll(domElements.percentage));

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

      document.querySelector(domElements.date).textContent = `${months[month]}, ${year}`;

    },

    deletefromList: (selectorID) => {
      document.getElementById(selectorID).remove();
    },

    getUserCurrency: () => {
      document.querySelector(domElements.userCurrency).innerHTML = document.querySelector(domElements.selectCurrency).value;
    }

  };

})();