export const appModel = (function () {
  //object constructor for the Input Data, both expense and income
  class Input {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const calculateTotal = (type) => {
    let sum = 0;
    readData(type).then((data) => {
      for (var i = 0; i < data.length; i++) {
        sum += data[i].value;
        localStorage.setItem(type, sum);
      }
    });
    
  };

  const addNewData = async (type, desc, val) => {
    try {
      const data = await readData(type);
      console.log(data)
      let newData, newId;
      if (data.length === 0) {
        newId = 1;
        newData = new Input(newId, desc, val);
      }else{
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

    calculateBalance: function () {
      let percentage;

      //first calculate total income and expenses
      calculateTotal("expense");
      calculateTotal("income");

      //then calculate the available balance
      let totalExpense = parseFloat(localStorage.getItem("expense"));
      let totalIncome = parseFloat(localStorage.getItem("income"));

      let balance = totalIncome - totalExpense;
      localStorage.setItem("Balance", balance);

      //Then calculate the percentage of the income spent if income is greater than zero
      if (totalIncome > 0) {
        percentage = Math.round((totalExpense / totalIncome) * 100);
      } else {
        percentage = -1;
      }
      localStorage.setItem("Percentage", percentage);
    },

    getBalance: function () {
      return {
        balance: parseFloat(localStorage.getItem("Balance")),
        totalIncome: parseFloat(localStorage.getItem("income")),
        totalExpense: parseFloat(localStorage.getItem("expense")),
        percentage: parseFloat(localStorage.getItem("Percentage")),
      };
    },

    resetLocalStorage: function () {
      localStorage.setItem("Balance", "0");
      localStorage.setItem("income", "0");
      localStorage.setItem("expense", "0");
      localStorage.setItem("Percentage", "0");
    },
  };
})();


