"use strict";

const main = document.getElementById("main");
const mainContainer = document.getElementById("main-container");
const mainEvent = document.getElementById("main-event");
const today = new Date();
const imgCheckout = document.getElementById("img-checkout");
const saveToCart = document.getElementById("save-to-cart");
let eventsData;
let eventT = {};
const urlBase = document.URL;

const mainContainerCheckout = document.getElementById(
  "main-container-checkout"
);
const ticketName = document.getElementById("ticket-name");
const ticketDescription = document.getElementById("ticket-description");
const ticketPrice = document.getElementById("ticket-price");
const ticketSum = document.getElementById("sum-ticket");
const ticketRest = document.getElementById("rest-ticket");
const ticketAmount = document.getElementById("ticket-amount");
const ticketCheckout = document.getElementById("ticket-checkout");
const btnClose = document.querySelector(".btn-close");
const messageEmptyCart = document.getElementById("message-empty-cart");
const subtotal = document.getElementById("subtotal");
const tax = document.getElementById("tax");
const total = document.getElementById("total");
const extraItemsContainer = document.querySelector(".list-group");
const timeToExpire = document.getElementById("timeToExpire");
const trash = document.getElementById("trash");
localStorage.setItem("cart", JSON.stringify({}));
localStorage.setItem("ticketsAmount", JSON.stringify(0));

let tickets = 1;
let subTotal = 0;
let totalTax = 0;
let totalShipping = 0;
let totalPrice = 0;

const getRandomArbitrary = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

const renderMainContent = () => {
  const mainEvent = `
        <section class="py-5 text-center container">
        <div class="row py-lg-5">
          <div class="col-lg-6 col-md-8 mx-auto">
            <h1 id="brand" class="fw-light">Tickets APP</h1>
            <p class="lead text-muted">
              Try to buy an ticket just if price is available
            </p>
          </div>
        </div>
      </section>
  `;
  /* mainContainer.insertAdjacentHTML("afterbegin", mainContent); */
  main.insertAdjacentHTML("afterbegin", mainEvent);
};

const wait = (seconds) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
};

const removeSpinner = () => {
  const spinner = document.getElementById("spinner-div");
  spinner.remove();
};

const displaySpinner = () => {
  const spinner = `      
  <div id="spinner-div" class="d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`;
  main.insertAdjacentHTML("beforeend", spinner);
};

const loadData = () => {
  return fetch(
    "https://app.ticketmaster.com/discovery/v2/events?apikey=cdRYr6K8DdUBupEihGGbZEgrM46v3b10&size=10"
  );
};

const renderEvents = () => {
  const {
    page: { size },
    _embedded: { events },
  } = eventsData;

  mainEvent.classList.add("bg-light");
  for (const event of events) {
    const {
      name: eventName,
      id,
      images,
      priceRanges,
      dates: {
        start: { localDate },
      },
    } = event;
    const timeLeft = Math.ceil(
      (new Date(localDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (timeLeft < 0) {
      continue;
    }
    const disabled = priceRanges?.[0]?.min ? "" : "disabled";

    const col = `
    <div class="col">
    <div class="card shadow-sm h-100">
        <img src="${images[0].url}" height="250px" width="100%">
          <title>Placeholder</title>
          <rect width="100%" height="100%" fill="#55595c" />
        </svg>
      <div class="card-body">
        <p class="card-text event-title fw-bold">
          ${eventName}
        </p>
        <p class="card-text event-date">
          ${localDate}
       </p>
        <p class="card-text event-price">
        ${
          priceRanges?.[0]?.min
            ? `From $${priceRanges?.[0]?.min}`
            : "Price not available"
        }
       </p>
        <div
          class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
          <a href="#${id}" class="btn btn-sm btn-outline-secondary ${disabled}">
              Add to cart
          </a>
          </div>
          <small class="text-muted">${
            timeLeft === -0 ? "Today" : `${timeLeft} days left`
          }</small>
        </div>
      </div>
    </div>
  </div>
    `;
    mainContainer.insertAdjacentHTML("beforeend", col);
  }
};

displaySpinner();
loadData()
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    eventsData = data;
    return wait(getRandomArbitrary(1, 1));
  })
  .then((wait) => {
    removeSpinner();
    console.log(eventsData);
    renderMainContent();
    renderEvents();
    console.log("Loading finished");
  });

const getEvent = async (id) => {
  // Get single event from endpoint
  const response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events/${id}?apikey=cdRYr6K8DdUBupEihGGbZEgrM46v3b10`
  );
  const data = await response.json();
  return data;
};

const renderCheckout = async () => {
  const cartObject = JSON.parse(localStorage.getItem("cart"));
  const ticketsAmount = JSON.parse(localStorage.getItem("ticketsAmount"));
  if (Object.keys(cartObject).length !== 0) {
    swal(
      "You've already selected an event",
      "Please remove the selected event from the cart",
      "warning"
    );
  } else {
    // Render event in checkout
    const id = window.location.hash.slice(1);
    const data = await getEvent(id);
    console.log(data);

    eventT = {
      name: data.name,
      description: data._embedded.venues[0].name,
      price: data.priceRanges[0].min,
      tax: 0.05,
      img: data.images[0].url,
    };
    ticketName.textContent = eventT.name;
    imgCheckout.src = eventT.img;
    displayPrice(eventT);
    displayInfoPrices(eventT);
    trash.classList.remove("disabled");
    ticketSum.classList.remove("disabled");
    saveToCart.classList.remove("disabled");
    saveToCart.scrollIntoView({ behaviour: "smooth", block: "end" });
  }
};

window.addEventListener("hashchange", renderCheckout);

/* Checkout */

const displayTicket = ({ name, description }) => {
  ticketName.textContent = name;
  ticketDescription.textContent = description;
};

const updatePrice = (ticket) => ticket.price * tickets;

const displayInfoPrices = (eventSelected) => {
  subTotal = updatePrice(eventSelected);
  console.log(`subtotal: ${subTotal}`);
  totalTax = Math.round(eventSelected.tax * subTotal * 100) / 100;
  totalPrice = Math.round((subTotal + totalTax) * 100) / 100;
  subtotal.textContent = `$${subTotal}`;
  tax.textContent = `$${totalTax}`;
  total.textContent = `$${totalPrice}`;
};

const resetInfoPrices = () => {
  subtotal.textContent = "$0.00";
  tax.textContent = "$0.00";
  total.textContent = "$0.00";
};

function displayPrice(ticket) {
  ticketPrice.textContent = `${updatePrice(ticket)} USD`;
}

ticketSum.addEventListener("click", () => {
  tickets++;
  ticketAmount.textContent = tickets;
  tickets > 1
    ? ticketRest.classList.remove("class", "disabled")
    : ticketRest.classList.add("class", "disabled");

  /*if (tickets > 1) {
    ticketRest.classList.remove("class", "disabled");
  } else {
    ticketRest.classList.add("class", "disabled");
  } */
  displayPrice(eventT);
  displayInfoPrices(eventT);
});

ticketRest.addEventListener("click", () => {
  if (tickets <= 2) {
    tickets--;
    ticketRest.classList.add("class", "disabled");
  } else {
    tickets--;
    ticketRest.classList.remove("class", "disabled");
  }
  ticketAmount.textContent = tickets;
  displayPrice(eventT);
  displayInfoPrices(eventT);
});

trash.addEventListener("click", () => {
  eventT = {};
  imgCheckout.src = "./assets/empty_cart.webp";
  tickets = 1;
  ticketAmount.textContent = tickets;
  ticketPrice.textContent = `$0.00`;
  ticketSum.classList.add("disabled");
  ticketRest.classList.add("disabled");
  trash.classList.add("disabled");
  displayTicket("Event not selected", "");
  resetInfoPrices();
  saveToCart.classList.add("disabled");
  localStorage.setItem("cart", JSON.stringify({}));
  localStorage.setItem("ticketsAmount", JSON.stringify(0));
  document
    .getElementById("brand")
    .scrollIntoView({ behaviour: "smooth", block: "start" });
  window.history.pushState(
    { html: "index.html", pageTitle: "home" },
    "",
    urlBase
  );
  setTimeout(() => {
    swal("Your item was deleted!", "The cart is empty", "info");
  }, 1000);
});

saveToCart.addEventListener("click", () => {
  saveToCart.classList.add("disabled");
  localStorage.setItem("cart", JSON.stringify(eventT));
  localStorage.setItem("ticketsAmount", tickets);
  ticketSum.classList.add("disabled");
  ticketRest.classList.add("disabled");
  swal("An event was added to cart", "Is yours!", "success");
});

const checkCart = () => {
  const cartObject = JSON.parse(localStorage.getItem("cart"));
  const ticketsAmount = JSON.parse(localStorage.getItem("ticketsAmount"));
  if (Object.keys(cartObject).length !== 0) {
    console.log(!Object.keys(cartObject).length === 0);
    ticketAmount.textContent = ticketsAmount;
    ticketName.textContent = cartObject.name;
    imgCheckout.src = cartObject.img;
    displayPrice(cartObject);
    displayInfoPrices(cartObject);
    ticketSum.classList.add("disabled");
    ticketRest.classList.add("disabled");
    trash.classList.remove("disabled");
  }
};

checkCart();
