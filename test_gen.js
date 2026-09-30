const currentPrice = 14350000;
const currentHour = new Date().getHours();
      
const realArr = new Array(currentHour + 1).fill(0);
realArr[currentHour] = currentPrice;
for (let i = currentHour - 1; i >= 0; i--) {
const change = realArr[i+1] * (Math.random() * 0.008 - 0.004); 
realArr[i] = Math.round((realArr[i+1] + change) / 10000) * 10000;
}

const forecastArr = new Array(25).fill(0);
for (let i=0; i<=currentHour; i++) {
    forecastArr[i] = Math.round((realArr[i] * (1 + (Math.random()*0.004 - 0.002)))/10000)*10000;
}
for(let i=currentHour+1; i<25; i++) {
    const trend = (Math.random() > 0.4 ? 1 : -1); 
    const change = forecastArr[i-1] * (Math.random() * 0.006 * trend);
    forecastArr[i] = Math.round((forecastArr[i-1] + change)/10000)*10000;
}

const makeOhlc = (arr) => {
    return arr.map((val, i) => {
        const open = i === 0 ? val : arr[i-1];
        const close = val;
        const minOC = Math.min(open, close);
        const maxOC = Math.max(open, close);
        const high = maxOC + Math.round((maxOC * (Math.random()*0.003))/10000)*10000;
        const low = minOC - Math.round((minOC * (Math.random()*0.003))/10000)*10000;
        return { o: open, h: high, l: low, c: close };
    });
};

const real = makeOhlc(realArr);
const forecast = makeOhlc(forecastArr);

console.log(real.some(d => isNaN(d.c)));
console.log(forecast.some(d => isNaN(d.c)));