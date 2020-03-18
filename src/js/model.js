
export const budgetModel= (function() {
 
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

