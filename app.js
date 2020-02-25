//Todo : Resolve placeholder disapparing after text is entered.
//Store values in database so theyre not lost on reload;
//Use User Country API to get user default currency.
//Make it PWA
//if its the end of a month, remove income and expenses from the UI, store it and reset it.

//Handles everything relating to the budget data structure and storage
const budgetController = (function() {
 
  //constructor for the Expenses Data
   class Expense{
      constructor(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
      }

      calcPercentage(totalIncome){
        if(totalIncome > 0){
          this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
          this.percentage = -1;
        }
      }

      getPercentage(){
        return this.percentage;
      }
   } 

   //function constructor for the Income Data
  class Income{
    constructor(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

   //data structure for all digit data. Planning to use firebase
   let data = {
     allItems: {
       expense:[],
       income: []
     },
     totals:{
       expense: 0,
       income: 0
     },
     balance: 0,
     percentage: -1
   }

   const calculateTotal = function(type) {
     let sum = 0;
     data.allItems[type].forEach(function(val){
       sum += val.value;
     });
     data.totals[type] = sum;  
   }

   return {
     addItem: function(type, desc, val){
       let newAdd, iD;

       //Create an ID if array length is greater than zero, else ID = 1;
       if(data.allItems[type].length > 0){
         iD = data.allItems[type][data.allItems[type].length - 1].id + 1;
       }else{
          iD = 1;
       }
       //Create new Item based on input type and push to the respective array
       if(type === 'expense'){
         newAdd = new Expense(iD, desc, val);
         data.allItems.expense.push(newAdd);
       }else if(type === 'income'){
         newAdd = new Income(iD, desc, val)
         data.allItems.income.push(newAdd);
       }
       //return the newly created income or expense
      
       return newAdd;

      },

     deleteItem: function(type,Id){
       let ids, index;
       //Create a new array containing the id's of all entry to the array of type
       ids = data.allItems[type].map(function(current){
         return current.id
       })
       //Pick out the index of the id passed in the function in the new ids array
       index = ids.indexOf(Id);
       //if the index exists, remove the entry with the same index number from the same array.
       if(index !== -1){
          data.allItems[type].splice(index, 1);
       }
       
      },

     calculateBalance: function(){
       //first calculate total income and expenses
       calculateTotal('expense');
       calculateTotal('income');
       //then calculate the available balance
       data.balance = data.totals.income - data.totals.expense;
       //Then calculate the percnetage of the income spent if income is greater than zero
       if(data.totals.income > 0){
        data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
       }else{
         data.percentage = -1;
       }
      },

     calcualtePercentages: function(){
       data.allItems.expense.forEach(function(current){
         current.calcPercentage(data.totals.income);
       })
     },

     getPercentages: function(){
       //loop through all expense items and get the percentage
       let allPercentages = data.allItems.expense.map(function(current){
         return current.getPercentage();
       })
       return allPercentages;
     },

     getBalance: function(){
       return{
         balance: data.balance,
         totalIncome: data.totals.income,
         totalExpense: data.totals.expense,
         percentage: data.percentage
       }
     }
   };

})();

//Handles Collection of data from the UI and all UI interactivity
const uiController = (function() {

 //object contains all the dom variables for easier implementation of change
  const DOMStrings = {
    desktopType: '.input_option',
    desktopDescription: '.input_description',
    desktopValue: '.input_amount',
    overlayType : '.overlay_option',
    overlayDescription:'.overlay_description',
    overlayValue:'.overlay_amount',
    addBtnDesktop: '.add',
    incomeList: '.add-incomes_list',
    expenseList:'.add-expenses_list',
    addMobileButton: '.add_mobile_button',
    overlayForm: '#overlay_form',
    overlayFormAdd: '.overlay_add',
    overlay:'.overlay',
    errMsg: '.err_msg',
    errMsgMobile: '.err_msg_mobile',
    availableBalance: '.available_funds',
    totalIncome:'.total__income',
    totalExpense:'.total__expense',
    totalPercentage: '.total__percentage',
    main:'.main',
    deleteBtn:'.add_remove',
    percentage:'.add_percentage',
    date:'.date',
    sign:'.sign',
    settingsBody: '.settings_body',
    settingsIcon: '.settings_icon',
    settingsBodyContent: '.settings_body_content'
  };
  
  //Private function to format numbers
  const formatNumber = function(num){
    let  numSplit, integer, decimal;

    //Make the number an absolute one i.e remove any sign, fixed to a decimal point of two
    num = Math.abs(num).toFixed(2);//returns a string
    //Spilt number into 2 parts, one for interger, the for the decimal part
    numSplit = num.split('.');
    //Assign the interger and decimal sides to variables
    integer = numSplit[0];
    decimal = numSplit[1];
    //format integer to add commas
    int = parseInt(integer).toLocaleString();
    //if type of num is expense return - and the formatted number, else return +, then the formatted number
    return  int + '.' + decimal;
  };

  return{

    getInput: function(){
      //if viewport width is less than 520px, read data from the overlay form instead of the desktop form
        if(window.innerWidth  <= 520){
          return{
            inputType: document.querySelector(DOMStrings.overlayType).value, 
            inputDescription: document.querySelector(DOMStrings.overlayDescription).value,
            inputValue: parseFloat(document.querySelector(DOMStrings.overlayValue).value)
          }
        }else {
          return{
            inputType: document.querySelector(DOMStrings.desktopType).value, //will return either 'expense' or 'income'.
            inputDescription: document.querySelector(DOMStrings.desktopDescription).value,
            inputValue: parseFloat(document.querySelector(DOMStrings.desktopValue).value)
          }
          
        }
      
    },

    //Publicly accessible method which accepts the resulting object; newItem and its type
    addItemToList: function(obj, type){
      let listHtml, newHtml, element,sign;
      //Create html templates based on each input type i.e income or expenses
      if(type === 'income'){
        element = DOMStrings.incomeList;
        sign = '+'
        listHtml = '<li id="income-%id%"><span class="add_remove">&times</span><span class="add_description">%description%</span><span class="add_amount">%amount%</span></li>'
      }else if(type === 'expense'){
        element = DOMStrings.expenseList;
        sign = '-'
        listHtml = '<li id="expense-%id%"><span class="add_remove">&times</span><span class="add_description">%description%</span><span class="add_amount">%amount%</span><span class="add_percentage">- %per%</span></li>'
      }

      //Replace placeholders in listHtml with actual data from the obj.
      newHtml = listHtml.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%amount%',`${sign} ${formatNumber(obj.value,type)}`);

      //Insert newHtml to either an expense list or income list
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    //Function to display the Mobile Form
    displayMobileForm : function(){
       document.querySelector(DOMStrings.overlay).style.visibility = "visible";
       document.querySelector(DOMStrings.overlayForm).style.visibility = "visible";
       document.querySelector(DOMStrings.overlayForm).style.height = "28rem";
    },

    //Function to close the Mobile Form and overlay
    removeOverlay: function(){
      document.querySelector(DOMStrings.overlay).style.visibility = "hidden";
      document.querySelector(DOMStrings.overlayForm).style.visibility = "hidden";
      document.querySelector(DOMStrings.overlayForm).style.height = "0";
      
    },

    //Display or Hide settings panel on click
    shSettingsBody: function(){
      document.querySelector(DOMStrings.settingsBody).classList.remove('hidden');
      document.querySelector(DOMStrings.settingsBody).classList.toggle('close');
      document.querySelector(DOMStrings.settingsBody).classList.toggle('open');
      document.querySelector(DOMStrings.settingsBodyContent).classList.toggle('hidden');
      
    },
    
    clearFormFields : function(){
      var formFields = [];
  
      if(window.innerWidth <= 520){
        formFields = [ document.querySelector(DOMStrings.overlayDescription) , document.querySelector(DOMStrings.overlayValue)]
      }else {
        formFields = [ document.querySelector(DOMStrings.desktopDescription) , document.querySelector(DOMStrings.desktopValue)]
      }

      formFields.forEach(function(current){
        current.value = " ";
        formFields[1].placeholder = 'Amount';
      })
      //formFields[0].placeholder = 'Add a description for the income or expense';
      //formFields[1].placeholder = 'Amount';
      //formFields[0].focus();
    },

    displayBalance: function(obj){
      let type, sign;
      obj.balance > 0 ? type = 'income' : type = 'expense';
      type === 'income'? sign = '+' : sign = '-';
      
      document.querySelector(DOMStrings.sign).textContent = sign;
      document.querySelector(DOMStrings.availableBalance).textContent = formatNumber(obj.balance);
      document.querySelector(DOMStrings.totalIncome).textContent = formatNumber(obj.totalIncome);
      document.querySelector(DOMStrings.totalExpense).textContent = formatNumber(obj.totalExpense);

      if(obj.percentage > 0){
        document.querySelector(DOMStrings.totalPercentage).textContent = obj.percentage + '%';
      }else{
        document.querySelector(DOMStrings.totalPercentage).textContent = '--';
      }
      
    },

    displayPercentages: function(percentages){
       let fields;

       //Select all expense percentages span and convert the nodelist to an array
       fields = Array.from(document.querySelectorAll(DOMStrings.percentage));

       //Call the nodelistforeaach function to loop through the fields nodestring
       fields.forEach((field,index) => {
        if(percentages[index] > 0){
          field.textContent = `- ${percentages[index]}%`;
        }else{
          field.textContent = `--`;
        }
       }
      );

    },
    
    displayDate: function(){
      let now, year, month;
      now = new Date();
      //get month
      month = now.getMonth();//returns an integer of a zero based array representing respective months
      months = ['January','Febuary','March','April','May','June','July','August','September','October','November','December'];
      
      year = now.getFullYear();

      document.querySelector(DOMStrings.date).textContent = `${months[month]}, ${year}`;
      
    }, 

    deletefromList: function(selectorID){
      document.getElementById(selectorID).remove();
    },

    //Making the private DOMStrings object publicly accessible to other controllers.
    getDOMStrings: function(){
      return DOMStrings
    },


  };

})();




//The Controller. Combines functions from the view and model
//----------------------------------------------------------
const appController = (function(budgetCtl, uiCtl) {
  const DOM = uiCtl.getDOMStrings();
  
  //function contains all event listners to keep things organized.
  const setupEventListners = function(){
    //Add overlay and overlay form when mobile button is clicked
    document.querySelector(DOM.addMobileButton).addEventListener('click',uiCtl.displayMobileForm);

    //Remove overlay and overlay form when overlay is clicked
    document.querySelector(DOM.overlay).addEventListener('click',uiCtl.removeOverlay);

    //Event listner for the desktop add key
    document.querySelector(DOM.addBtnDesktop).addEventListener('click',addItemToUI);
  

    //close overlay form and add form contents to UI
    document.querySelector(DOM.overlayFormAdd).addEventListener('click', addItemToUI)

   //event listener for the enter key
    document.addEventListener('keypress',function(event){
      if (event.keyCode === 13 || event.which === 13){
        addItemToUI();
      }
    });

    document.querySelector(DOM.main).addEventListener('click', deleteFromUI);

    document.querySelector(DOM.settingsIcon).addEventListener('click', uiCtl.shSettingsBody);
  }
  
  const updateBalance = function(){
    //Calculate the balance
    budgetCtl.calculateBalance();
    //Return the balance
    var balance = budgetCtl.getBalance();
    //Display the balance on the UI
    uiCtl.displayBalance(balance);

  }

  const updatePercentages = function(){
     //calculate percentage
     budgetCtl.calcualtePercentages();

     //Read percentages from the budget controller
     var percentages = budgetCtl.getPercentages();

     //Update UI with the new percentages
     uiCtl.displayPercentages(percentages);
  }

  //Function merges the activities of the uiController and budgetController to add elements to the UI
  const addItemToUI = function(){
    var input, newItem;
    //Get new data object from the the input fields
    input = uiCtl.getInput();

    //check that input fields are not empty and correct data is entered.
    if((input.inputDescription !== " ") && !isNaN(input.inputValue) && input.inputValue > 0){
      //clear error message
      document.querySelector(DOM.errMsg).textContent = " ";
      document.querySelector(DOM.errMsgMobile).textContent = " ";
      //Add new data object to the budget controller
      newItem = budgetCtl.addItem(input.inputType, input.inputDescription, input.inputValue)
      //add item to UI
      uiCtl.addItemToList(newItem,input.inputType);
      //clear form fields
      uiCtl.clearFormFields();
      //Calculte and dispaly balance
      updateBalance();
      //Calculate and update percentagea
      updatePercentages();

    }else{
      if(window.innerWidth <= 520){
        document.querySelector(DOM.errMsgMobile).textContent = `*Please enter a description in words and an amount in numbers greater than 0`;
      }else{
        document.querySelector(DOM.errMsg).textContent = `*Please enter a description in words and an amount in numbers greater than 0`;
      }
       
    }

  }

  const deleteFromUI = function(event){
      var itemID, splitID, type, Id;
      //check if target of the event delegation on the main element is a delete button
      if(event.target.className === 'add_remove' ){
        //get the id of the corresponding list and extract the type and ID
        itemID = event.target.parentNode.id;
        splitID = itemID.split('-');
        type = splitID[0];
        Id = parseInt(splitID[1]);
        
        //Delete the item from the data structure
        budgetCtl.deleteItem(type,Id);

        //Delete item from the UI
        uiCtl.deletefromList(itemID);

        //Recalculate and update balance
        updateBalance();

        //Recalculate and update percentages
        updatePercentages();
      }    
  }

  return{
    init:function(){
      uiCtl.displayDate();
      setupEventListners();
    }
  }

})(budgetController, uiController);

//Calling the initialization function
appController.init();
