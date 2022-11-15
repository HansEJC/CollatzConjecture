"use strict";
(new URL(document.location)).searchParams.forEach((x, y) => {
  localStorage.setItem(y, x);
});
//Toggle Dark Mode
(function () {
  //Add toggle to page
  const switchLabel = document.createElement('label');
  const toggLabel = document.createElement('div');
  const checkBox = document.createElement('input');
  const spanny = document.createElement('span');
  switchLabel.classList.add('switch');
  checkBox.id = "DarkToggle";
  checkBox.type = "checkbox";
  spanny.classList.add('slider', 'round');
  toggLabel.innerText = "Dark Mode";
  toggLabel.classList.add('toggLabel');
  switchLabel.htmlFor = "DarkToggle";
  switchLabel.appendChild(checkBox);
  switchLabel.appendChild(spanny);
  document.querySelector("#header").appendChild(switchLabel);
  document.querySelector("#header").appendChild(toggLabel);

  // Use matchMedia to check the user preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const darkToggle = document.querySelector("#DarkToggle");

  //Toggle to change mode manually
  darkToggle.addEventListener('change', function () { toggleDarkTheme(darkToggle.checked); saveCheckbox(this); });

  toggleDarkTheme(prefersDark.matches && (getSavedValue(darkToggle.id) !== "false"));
  if (getSavedValue(darkToggle.id) === "true") toggleDarkTheme(true); //iif statement as it would turn off if false
  //if ((prefersDark.matches || (getSavedValue(darkToggle.id) === "true")) && !darkToggle.checked) darkToggle.click();

  // Listen for changes to the prefers-color-scheme media query
  prefersDark.addListener((mediaQuery) => toggleDarkTheme(mediaQuery.matches));

  // Add or remove the "dark" class based on if the media query matches
  function toggleDarkTheme(shouldAdd) {
    document.body.classList.toggle('dark', shouldAdd);
    darkToggle.checked = shouldAdd;
  }
}());

//fade in and fadeout
function _(el) {
  if (!(this instanceof _)) {
    return new _(el);
  }
  this.el = document.querySelector(el);
}

_.prototype.fade = function fade(type, ms) {
  const isIn = type === 'in',
    interval = 50,
    duration = ms,
    gap = interval / duration,
    self = this;
  let opacity = isIn ? 0 : 1;

  if (isIn) {
    self.el.style.display = 'inline';
    self.el.style.opacity = opacity;
  }

  function func() {
    opacity = isIn ? opacity + gap : opacity - gap;
    self.el.style.opacity = opacity;

    if (opacity <= 0) self.el.style.display = 'none'
    if (opacity <= 0 || opacity >= 1) window.clearInterval(fading);
  }
  const fading = window.setInterval(func, interval);
};

function logError(err) {
  const div = document.createElement('div');
  const errdiv = document.getElementById("copyright");
  document.querySelectorAll("#error").forEach(x => x.parentNode.removeChild(x));
  errdiv.insertBefore(div, errdiv.lastChild);
  div.innerHTML = `<center>${err}</center>`;
  div.id = "error";
  _('#error').fade('in', 300);
  setTimeout(() => {
    _('#error').fade('out', 1000);
  }, 3000);
}

function saveCheckbox(e) {
  document.querySelectorAll('input[type="checkbox"]').forEach(rad => localStorage.setItem(rad.id, rad.checked));
  saveParameter();
}

//get the saved value function - return the value of "v" from localStorage.
function getSavedValue(v) {
  if (!localStorage.getItem(v)) {
    return "";// You can change this to your defualt value.
  }
  return localStorage.getItem(v);
}
//Save the value function - save it to localStorage as (ID, VALUE)
function saveValue(e) {
  const { id, value } = e;  // get the sender's id to save it .
  localStorage.setItem(id, value);// Every time user writing something, the localStorage's value will override .
  saveParameter();
}

function saveParameter() {
  let url = '';
  const params = {};
  document.querySelectorAll('input').forEach((el) => {
    if (el.value.length > 0) params[el.id] = el.value;
    if (el.type === `checkbox` || el.type === `radio`) params[el.id] = el.checked;
  });
  document.querySelectorAll('select').forEach((select) => params[select.id] = select.value);
  const esc = encodeURIComponent;
  const query = Object.keys(params)
    .map(k => `${esc(k)}=${esc(params[k])}`)
    .join('&');
  url += `?${query}`;
  const newurl = `${window.location.protocol}//${window.location.host + window.location.pathname + url}`;
  window.history.pushState({ path: newurl }, '', newurl);
}

const smoothdec = (a, b = 2) => Number(parseFloat(a).toFixed(b)); //fix broken decimals
document.documentElement.setAttribute('lang', navigator.language); //add language to html

function startup() {
  document.querySelectorAll(`input`).forEach(inp => inp.addEventListener(`keyup`, collatz));
  collatz();
}

function collatz() {
  const end = Number(document.querySelector(`#End`).value) || 100;
  const range = Number(document.querySelector(`#Range`).value) || 100;
  const start = Math.max(1, end - range, document.querySelector(`#Start`).value);
  const labels = [];
  const array = [];
  for (let i = start; i <= end; i++) {
    let n = i;
    let c = 0;
    labels.push(`${n}`);
    while (n >= 1) {
      if (typeof array[c] === `undefined`) array[c] = [c];
      array[c][i - start + 1] = n;
      if (n === 1) break;
      n = test(n);
      c++;
    }
  }
  while (labels.length < array[0].length) labels.unshift(`eh`);
  dygPlot(array, labels);
}

const test = (n) => n % 2 === 0 ? n / 2 : 3 * n + 1;

async function dygPlot(total, labels) {
  try {
    if (typeof g3 !== 'undefined') g3.destroy();
  } catch (e) { logError(e); }
  window.g3 = new Dygraph(
    document.getElementById("graphdiv3"),
    total,
    {
      labels,
      xlabel: "Iteration",
      ylabel: "Number",
      drawAxesAtZero: true,
    }          // options
  );
  g3.ready(function () {
    setTimeout(function () {
      window.dispatchEvent(new Event('resize'));
    }, 500);

  });
}

//startup
startup();