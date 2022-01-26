
/*
 * convertObjectToEnum : convert object to enum
 * @param obj          : {}
 */
const convertObjectToEnum = (obj) => {
  const enumArr = [];
  Object.values(obj).map((val) => enumArr.push(val));
  return enumArr;
};

/*
 * randomNumber : generate random numbers.
 * @param length          : number *default 4
 */
const randomNumber = (length) => {
  const numbers = '12345678901234567890';
  let result = '';
  for (let i = length; i > 0; i -= 1) {
    result += numbers[Math.round(Math.random() * (numbers.length - 1))];
  }
  return result;
};

/*
 * replaceAll: find and replace al; occurrence of a string in a searched string
 * @param string : string to be replace
 * @param search : string which you want to replace
 * @param replace: string with which you want to replace a string
 */
const replaceAll = (string, search, replace) => string.split(search).join(replace);

module.exports = {
  convertObjectToEnum,
  randomNumber,
  replaceAll,
};
