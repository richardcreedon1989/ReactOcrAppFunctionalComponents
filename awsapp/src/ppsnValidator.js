export const isPPSNValid = (ppsn) => {
    if (ppsn.length !== 8) {
        return false;
    }
    const checkChar = ppsn.charAt(7).toUpperCase();
    const checkNum = checkChar.charCodeAt(0) - 64;
    let sum = 0;
    for (let i = 2; i < 9; i++) {
        sum += parseInt(ppsn.charAt(8 - i)) * i;
    }
    return sum % 23 === checkNum;
};

export const isPPSNValidNew = (ppsn) => {
    if (ppsn.length !== 9) {
        return false;
    }
    const checkChar = ppsn.charAt(7).toUpperCase();
    const checkNum = checkChar.charCodeAt(0) - 64;
    let sum = 0;
    for (let i = 2; i < 9; i++) {
        sum += parseInt(ppsn.charAt(8 - i)) * i;
    }
    const newCheckChar = ppsn.charAt(8).toUpperCase();
    const newCheckNum = newCheckChar.charCodeAt(0) - 64;
    sum += newCheckNum * 9;

    return sum % 23 === checkNum;
};