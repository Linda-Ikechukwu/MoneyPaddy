

export const appModel = (function () {

  //constructor for the Input Data, both expense and income
  class Input {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }

  }

  const calculateTotal = (type) => {
    let sum = 0;
    readData(type).then(data => {
      for (var i = 0; i < data.length; i++) {
        sum += data[i].value
      }
    })
    localStorage.setItem(type, sum);
  }

  return {

    addToDB: function (type, desc, val) {
      let newAdd;
      let Id;
      //Create an ID if array length is greater than zero, else ID = 1;
      if(type==='expense'){
        readData('expense').then(data => {
          if (data && data.length > 0) {
            Id = data[data.length - 1] + 1;
            console.log(Id)
          } else {
            Id = 1;
           
          }
        })
        newAdd = new Input(Id, desc, val);
        writeData('expense', newAdd)
      }else{
        readData('income').then(data => {
          if (data && data.length > 0) {
            Id = data[data.length - 1] + 1;
            console.log(Id)
          } else {
            Id = 1;
          }
        })
        newAdd = new Input(Id, desc, val)
        writeData('income', newAdd)
      }
      return newAdd;

    },



    deleteFromDB: function (type, Id) {
      deleteData(type, Id);
    },

    calculateBalance: function () {
      let percentage;

      //first calculate total income and expenses
      calculateTotal('expense');
      calculateTotal('income');

      //then calculate the available balance
      let totalExpense = parseFloat(localStorage.getItem('expense'));
      let totalIncome = parseFloat(localStorage.getItem('income'));

      let balance = totalIncome - totalExpense;
      localStorage.setItem('Balance', balance);

      //Then calculate the percentage of the income spent if income is greater than zero
      if (totalIncome > 0) {
        percentage = Math.round((totalExpense / totalIncome) * 100);
      } else {
        percentage = -1;
      }
      localStorage.setItem('Percentage', percentage);
    },

    getBalance: function () {
      return {
        balance: parseFloat(localStorage.getItem('Balance')),
        totalIncome: parseFloat(localStorage.getItem('income')),
        totalExpense: parseFloat(localStorage.getItem('expense')),
        percentage: parseFloat(localStorage.getItem('Percentage'))
      }
    },

    resetLocalStorage: function () {
        localStorage.setItem('Balance','0');
        localStorage.setItem('income','0');
        localStorage.setItem('expense','0');
        localStorage.setItem('Percentage','0');
    },

   
  };

})();

