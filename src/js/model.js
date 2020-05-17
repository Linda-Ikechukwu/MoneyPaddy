//This file contains functions that define data and object models for the app.

export const appModel = (function () {
  //object constructor for the Input Data, both expense and income
  class Input {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  //Calculate total value of each type of input in db i.e expense or income 
  const calculateTotal = async (type) => {

    const data = await readData(type);
    let sum = [];
    
    for (var i = 0; i < data.length; i++) {
      sum.push(parseInt(data[i].value));
    }
    
    let result = sum.reduce(function (a, b) {
      return a + b;
    }, 0);
    
    localStorage.setItem(type, result);


  };

  //Function to model new input and add to db
  const addNewData = async (type, desc, val) => {
    try {
      const data = await readData(type);
      let newData, newId;
      if (data.length === 0) {
        newId = 1;
        newData = new Input(newId, desc, val);
      } else {
        newId = data[data.length - 1].id + 1;
        newData = new Input(newId, desc, val);
      }

      await writeData(type, newData);
      return newData;

    } catch (error) {
      console.error(error);
    }
  }

  return {

    addToDB: async function (type, desc, val) {
      if (type === "income") {
        return await addNewData("income", desc, val);
      } else {
        return await addNewData("expense", desc, val);
      }
    },

    deleteFromDB: function (type, Id) {
      deleteData(type, Id);
    },

    reCalculateBalance: async function () {
      let percentage;

      //first calculate total income and expenses
      await calculateTotal("expense");
      await calculateTotal("income");
      
      //then calculate the available balance
      const totalExpense = parseFloat(localStorage.getItem("expense"));
      const totalIncome = parseFloat(localStorage.getItem("income"));

      const balance = totalIncome - totalExpense;
      localStorage.setItem("Balance", balance);

      //Then calculate the percentage of the income spent if income is greater than zero
      if (totalIncome > 0) {
        percentage = Math.round((totalExpense / totalIncome) * 100);
      } else {
        percentage = -1;
      }
      localStorage.setItem("Percentage", percentage);
    },

    initializeLocalStorage: function () {
      if (!((localStorage.hasOwnProperty('Balance')) && (localStorage.hasOwnProperty('income')) && (localStorage.hasOwnProperty('expense')) && (localStorage.hasOwnProperty('Percentage')))) {
        localStorage.setItem("Balance", 0);
        localStorage.setItem("income", 0);
        localStorage.setItem("expense", 0);
        localStorage.setItem("Percentage", 0);
        localStorage.setItem('userCurrency', '&#8358;');
      }
    },

    getBalance: function () {
      return {
        balance: parseFloat(localStorage.getItem("Balance")),
        totalIncome: parseFloat(localStorage.getItem("income")),
        totalExpense: parseFloat(localStorage.getItem("expense")),
        percentage: parseFloat(localStorage.getItem("Percentage")),
        userCurrency: localStorage.getItem("userCurrency")
      };
    },

    resetLocalStorage: function () {
      localStorage.setItem("Balance", 0);
      localStorage.setItem("income", 0);
      localStorage.setItem("expense", 0);
      localStorage.setItem("Percentage", 0);
    },
  };
})();


