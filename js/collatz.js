function startup() {
  document.querySelectorAll(`input`).forEach(inp => inp.addEventListener(`keyup`, collatz));
  collatz();
}

function collatz() {
  const end = Number(document.querySelector(`#End`).value) || 100;
  const range = Number(document.querySelector(`#Range`).value) || 100;
  const start = Math.max(1, end - range, document.querySelector(`#Start`).value);
  let labels = [];
  let array = [];
  for (let i = start; i <= end; i++) {
    let n = i;
    let c = 0;
    labels.push(`${n}`);
    while (n !== 1) {
      if (typeof array[c] === `undefined`) array[c] = [c];
      array[c][i - start + 1] = n;
      n = test(n);
      c++;
    }
  }
  while (labels.length < array[0].length) labels.unshift(`eh`);
  dygPlot(array, labels);
}

function test(n) {
  return n % 2 === 0 ? n / 2 : 3 * n + 1;
}

async function dygPlot(total, labels) {
  try {
    if (typeof g3 !== 'undefined') g3.destroy();
  } catch (e) { logError(e); }
  window.g3 = new Dygraph(
    document.getElementById("graphdiv3"),
    total,
    {
      labels,
      xlabel: "Number",
      ylabel: "Iteration",
      drawAxesAtZero: true,
    }          // options
  );
  g3.ready(function () {
    setTimeout(function () {
      window.dispatchEvent(new Event('resize'));
    }, 500);

  });
}



function summaryTable(data) {
  let maxfault = data[9][2]; //remove the risk of any initial fault recording noise
  const multi = smoothdec((data[1][0] - data[0][0]) * 1000) < 1 ? 1.3 : 2; //bigger multiplier for 1ms interval
  const column = [`Fault Level`, `Fault Duration`, `Fault Start`, `Fault Finish`, `Zone 1`, `Zone 2`, `Zone 3`];
  let timers = JSON.parse(localStorage.getItem(`ZoneTimers`));
  let duration = 0;
  let startflag = true;
  let endflag = true;
  let counter = 0; //counter to ignore first initial fault recording noise
  data.forEach(x => {
    if (maxfault * multi < x[2] && startflag && counter > 25) {
      duration = x[0];
      timers.unshift(`${smoothdec(x[0], 3)} s`);
      startflag = false;
    }
    if (maxfault > x[2] * multi && endflag && !startflag) {
      duration = x[0] - duration;
      timers.splice(1, 0, `${smoothdec(x[0], 3)} s`);
      endflag = false;
    }
    maxfault = Math.max(maxfault, x[2]);
    counter++;
  });
  duration = duration === 0 ? `???` : smoothdec(duration * 1000, 0);
  if (endflag) timers.unshift(`Error`, `Error`);
  const column2 = [`${smoothdec(maxfault / 1000)} kA`, `${duration} ms`, ...timers];

  const summaryArr = column.map((x, i) => [x, column2[i]]);
  table(summaryArr);
}

function table(rows) {
  const tabdiv = document.querySelector(`#SummaryTable`);
  const myTable = document.createElement(`table`);
  myTable.classList.add(`scores`);
  const row = myTable.insertRow(-1);
  row.insertCell(0).outerHTML = `<th>Item</th>`;
  row.insertCell(1).outerHTML = `<th>Result</th>`;

  try {
    rows.forEach(arr => {
      const row = myTable.insertRow(-1);
      [row.insertCell(0).innerHTML, row.insertCell(1).innerHTML] = arr;
    });
  } catch (err) { logError(err); }

  while (tabdiv.childElementCount > 1) tabdiv.removeChild(tabdiv.lastChild);
  tabdiv.appendChild(myTable);
}

//startup
startup();