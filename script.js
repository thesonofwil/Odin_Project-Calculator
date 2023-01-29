/**
 * Calculator object
 */
const calculator = {
  displayValue: "0",
  currentOperand: null, // Operand - each individual number
  previousOperand: null,
  operator: null,
  operands: [], // keep track of each operand
};

const maxChars = 9; // max number of digits for displaying purposes
const error = "error"; // error message e.g. divide by 0
let applyNegativeToNextNum = false; // determines sign of next operand

const clearBtn = document.querySelector("#clear");
const signBtn = document.querySelector("#sign");
const numberButtons = document.querySelectorAll(".num");
const operatorButtons = document.querySelectorAll(".operator");

clearBtn.addEventListener("click", () => {
  clear();
});

// Add event listener to number buttons and update display
numberButtons.forEach((numBtn) => {
  numBtn.addEventListener("click", () => {
    // reset first if in error state
    if (calculator.displayValue === error) {
      clear();
    }
    inputDigit(numBtn.value);
  });
});

// Add event listener to operator buttons and update display
operatorButtons.forEach((operatorBtn) => {
  operatorBtn.addEventListener("click", () => {
    // reset first if in error state
    if (calculator.displayValue === error) {
      clear();
    }

    // Special handling if decimal
    if (operatorBtn.value === ".") {
      inputDecimal();
    } else if (operatorBtn.value === "⌫") {
      backspace();
    } else if (operatorBtn.value === "=") {
      equals();

      // Input operators
    } else {
      inputOperator(operatorBtn.value);
    }
  });
});

/**
 * Sum two numbers
 * @param {number} a
 * @param {number} b
 * @returns the sum
 */
function add(a, b) {
  // Ensure both parameters are numbers
  return Number(a) + Number(b);
}

/**
 * Subtract a number from another number
 * @param {number} a
 * @param {number} b
 * @returns the difference
 */
function subtract(a, b) {
  return Number(a) - Number(b);
}

/**
 * Mutiplies a number with another number
 * @param {number} a
 * @param {number} b
 * @returns the product
 */
function multiply(a, b) {
  return a * b;
}

/**
 * Divide a number with another number
 * @param {number} a
 * @param {number} b
 * @returns the quotient
 */
function divide(a, b) {
  if (Number(b) === 0) {
    return error;
  }
  return a / b;
}

function exponent(a, b) {
  return Math.pow(a, b);
}

/** Performs a mathematical operation depending on the operator
 * @param {string} operator the numerical operator
 * @param {number} a the first number
 * @param {number} b the second number
 */
function operate(operator, a, b) {
  let result = null;
  if (operator === "+") result = add(a, b);
  else if (operator === "-") result = subtract(a, b);
  else if (operator === "×") result = multiply(a, b);
  else if (operator === "÷") result = divide(a, b);
  else if (operator === "^") result = exponent(a, b);
  else console.log("invalid operator");

  // if answer too long, round
  if (Number.isInteger(result) && result.toString().length > maxChars) {
    result = result.toExponential(maxChars - 2);
  } else if (!Number.isInteger(result) && result.toString().length > maxChars) {
    result = result.toFixed(maxChars);
    result = parseFloat(result); // trim trailing zeros
  }

  // update display
  clear();
  calculator.currentOperand = result;
  calculator.operands.push(result);
  calculator.displayValue = result.toString();
  updateDisplay();
}

/**
 * Updates the calculator's display area
 */
function updateDisplay() {
  const display = document.querySelector(".display");
  display.value = calculator.displayValue;
  display.innerHTML = calculator.displayValue;
}

/**
 * Clears and resets the calculator
 */
function clear() {
  calculator.displayValue = "0";
  calculator.currentOperand = null;
  calculator.operands = [];
  (calculator.previousOperand = null), (calculator.operator = null);
  applyNegativeToNextNum = false;
  signBtn.style.color = ""; // revert to original color
  updateDisplay();
}

/**
 * Deletes the most recent inputted character
 */
function backspace() {
  // If operator, simply remove it from display
  const display = calculator.displayValue.trim();
  if (isOperator(display.charAt(display.length - 1))) {
    calculator.displayValue = display.slice(0, display.length - 2);
    updateDisplay();
    return;
  }

  // Clear if only one digit left
  if (calculator.displayValue.length <= 1) {
    clear();
    return;
  } else {
    calculator.displayValue = display.slice(0, -1);
  }

  // Deleting last digit of current operand
  if (calculator.currentOperand.length === 1) {
    calculator.currentOperand = 0;

    // Continuing deleting current operand
  } else if (calculator.currentOperand === 0) {
    calculator.currentOperand = calculator.previousOperand;
    calculator.operands.pop();
    calculator.previousOperand =
      calculator.operands[calculator.operands.length - 1];
    calculator.currentOperand = calculator.currentOperand.trim().slice(0, -1);

    // Just remove last digit of operand
  } else {
    calculator.currentOperand = calculator.currentOperand.trim().slice(0, -1);
  }
  updateDisplay();
}

/**
 * Processes numerical inputs from calculator and updates appropriate fields
 * @param {string} digit number user inputs
 */
function inputDigit(digit) {
  const displayVal = calculator.displayValue;

  if (digit === "+/-") {
    changeSign();
  }

  // Prevent leading zeros if current number is already zero
  else if (digit === "0" && calculator.currentOperand === "0") {
    return;

    // Replace number with digit if current operand is a zero
  } else if (digit !== "0" && calculator.currentOperand === "0") {
    calculator.currentOperand = digit;
    if (applyNegativeToNextNum) {
      changeSign(); // changeSign updates display
    } else {
      calculator.displayValue =
        displayVal.substring(0, displayVal.length - 1) + digit;
      updateDisplay();
    }
  }

  // val = 0 if first time entering number
  else if (displayVal === "0") {
    calculator.displayValue = digit;
    calculator.currentOperand = digit;
    if (applyNegativeToNextNum) changeSign();
    // return; // changeSign updates display

    // Just append digit
  } else {
    // Update current operand depending on if it's been reset from inputting an operator
    calculator.currentOperand =
      calculator.currentOperand === null || calculator.currentOperand === "0"
        ? digit
        : (calculator.currentOperand += digit);

    // Format display properly if second operand has parentheses (for negatives)
    if (calculator.currentOperand < 0 && calculator.previousOperand !== null) {
      calculator.displayValue = `${calculator.previousOperand} ${calculator.operator} (${calculator.currentOperand})`;
    } else {
      calculator.displayValue += digit;
      if (applyNegativeToNextNum) changeSign();
    }
  }
  updateDisplay();
}

/**
 * Converts the current operand to be its opposite signed i.e. positive or negative
 */
function changeSign() {
  // e.g. user applies negative sign before entering number
  if (
    !applyNegativeToNextNum &&
    (calculator.currentOperand === null || calculator.currentOperand === "0")
  ) {
    applyNegativeToNextNum = true;
    signBtn.style.color = "#1AAD33"; // indicate to user next operand is negative
    return;

    // e.g. user changes mind and doesn't want to apply negative
  } else if (
    applyNegativeToNextNum &&
    (calculator.currentOperand === null || calculator.currentOperand === "0")
  ) {
    applyNegativeToNextNum = false;
    signBtn.style.color = ""; // revert to original color
    return;
  }

  calculator.currentOperand *= -1;
  if (calculator.previousOperand !== null && calculator.currentOperand < 0) {
    calculator.displayValue = `${calculator.previousOperand} ${calculator.operator} (${calculator.currentOperand})`;
  } else if (
    calculator.previousOperand !== null &&
    calculator.currentOperand > 0
  ) {
    calculator.displayValue = `${calculator.previousOperand} ${calculator.operator} ${calculator.currentOperand}`;
  } else {
    calculator.displayValue = `${calculator.currentOperand}`;
  }

  applyNegativeToNextNum = false;
  signBtn.style.color = "";
  updateDisplay();
}

/**
 * Special handling if user inputs a decimal character
 */
function inputDecimal() {
  // Case user enters decimal first
  if (calculator.displayValue === "0") {
    calculator.currentOperand = "0";

    // Case user enters decimal following operator
  } else if (
    calculator.currentOperand === null &&
    calculator.previousOperand !== null
  ) {
    calculator.currentOperand = "0";
    calculator.displayValue += "0";
  }

  // A number can only have one decimal point
  if (!calculator.currentOperand.toString().includes(".")) {
    calculator.displayValue += ".";
    calculator.currentOperand += ".";
    updateDisplay();
  }
}

/**
 * Processes operator inputs from calculator and updates appropriate fields
 * @param {string} operator operator which may be '+', '-', '×', or '÷'
 */
function inputOperator(operator) {
  const display = calculator.displayValue.trim();

  // User didn't enter number and inputted operator first
  // In this case, assume first operand is 0
  if (display === "0") {
    calculator.currentOperand = "0";
  }

  // Ensure only one operator is appended
  if (calculator.operator === null) {
    calculator.operands.push(calculator.currentOperand);
    calculator.operator = operator;
    calculator.previousOperand = calculator.currentOperand;
    calculator.currentOperand = null;
    calculator.displayValue += " " + operator + " ";
  }

  // Replace operator if user consecutively inputs operators
  else if (isOperator(display.charAt(display.length - 1))) {
    calculator.operator = operator;
    calculator.displayValue =
      calculator.displayValue.slice(0, display.length - 1) + operator + " ";
  }

  // User has a valid expression and enters another operator
  // Evaluate the expression first then add operator
  else if (calculator.operator !== null) {
    operate(
      calculator.operator,
      calculator.previousOperand,
      calculator.currentOperand
    );

    // Append operator
    calculator.operator = operator;
    calculator.operands.push(calculator.currentOperand);
    calculator.previousOperand = calculator.currentOperand;
    calculator.currentOperand = null;
    calculator.displayValue += " " + operator + " ";
  }
  updateDisplay();
}

/**
 * Evaluates expression if user inpts '='
 */
function equals() {
  // Only calculate if we have both operands and the operator
  if (
    calculator.previousOperand &&
    calculator.currentOperand &&
    calculator.operator
  ) {
    operate(
      calculator.operator,
      calculator.previousOperand,
      calculator.currentOperand
    );
  }
}

/**
 * Check if characcter is one of the mathematical operators
 * @param {string} char char to evaluate
 * @returns true if an operator
 */
function isOperator(char) {
  return (
    char === "+" || char === "-" || char === "×" || char === "÷" || char === "^"
  );
}

// Support for letting user operate calculator with keyboard
document.addEventListener("keydown", (event) => {
  let key = event.key;

  // input digits
  if (!isNaN(key)) {
    inputDigit(key);
  }

  // input operators
  if (key === "*") key = "×";
  else if (key === "/") key = "÷";
  if (isOperator(key)) {
    inputOperator(key);
  }

  if (key === ".") {
    inputDecimal();
  }

  if (key === "Backspace") {
    backspace();
  }

  if (key === "Enter" || key === "=") {
    equals();
  }
});
