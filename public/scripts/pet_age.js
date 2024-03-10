var petAgeDiv = document.getElementById("pet-age");

const createdDate = moment("2024-03-08"); // need creation date here

const currentDate = moment();
const petAge = currentDate.diff(createdDate, "days");

petAgeDiv.innerHTML = petAge + " days old";
