function modInverse(a, m) {
    // validate inputs
    [a, m] = [Number(a), Number(m)]
    if (Number.isNaN(a) || Number.isNaN(m)) {
      return NaN // invalid input
    }
    a = (a % m + m) % m
    if (!a || m < 2) {
      return NaN // invalid input
    }
    // find the gcd
    const s = []
    let b = m
    while(b) {
      [a, b] = [b, a % b]
      s.push({a, b})
    }
    if (a !== 1) {
      return NaN // inverse does not exists
    }
    // find the inverse
    let x = 1
    let y = 0
    for(let i = s.length - 2; i >= 0; --i) {
      [x, y] = [y,  x - y * Math.floor(s[i].a / s[i].b)]
    }
    return (y % m + m) % m
}
function primeFactor(num) {
    var factors = [];

    while (!(num & 1n)) {  
      factors.push(2n);
      num /= 2n;
    }
    
    // 'f*f <= num' is faster than 'f <= Math.sqrt(num)'
    for (var f = 3n; f*f <= num; f += 2n) {
      while (!(num % f)) { // remainder of 'num / f' isn't 0
        factors.push(f);
        num /= f;
      }
    }
    
    /* if the number is already prime, then this adds it to factors so
     * an empty array isn't returned
     */
    if (num != 1) {
      factors.push(num);
    }
    return factors;
  }

const modulo = (m,n) =>{
        return ((m% n) + n) % n;

}
const getPrimes = (min, max) => {
    const result = Array(max + 1)
      .fill(0)
      .map((_, i) => i);
    for (let i = 2; i <= Math.sqrt(max + 1); i++) {
      for (let j = i ** 2; j < max + 1; j += i) delete result[j];
    }
    return Object.values(result.slice(Math.max(min, 2)));
};

const getRandNum = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const getRandPrime = (min, max) => {
    const primes = getPrimes(min, max);
    return primes[getRandNum(0, primes.length - 1)];
};

module.exports ={getRandPrime,modulo,primeFactor,modInverse };