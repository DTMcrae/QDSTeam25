// var petAgeDiv = document.getElementById("pet-age");

// const createdDate = moment("data-registered-date"); // need creation date here
// console.log("createdDate: ", createdDate);

// const currentDate = moment();
// const petAge = currentDate.diff(createdDate, "days");

// petAgeDiv.innerHTML = petAge + " days old";

document.addEventListener('DOMContentLoaded', function() {
    calculatePetAge();
});

function calculatePetAge() {
    var petAgeDiv = document.getElementById("pet-age");
    
    // Fetch the registered date from the 'data-registered-date' attribute of the 'pet-age' div
    const registeredDateString = petAgeDiv.getAttribute('data-registered-date');

    // Check if the registeredDateString is valid
    if (registeredDateString) {
        const createdDate = moment(registeredDateString); // Use the fetched date here
        console.log("createdDate: ", createdDate);

        const currentDate = moment();
        const petAge = currentDate.diff(createdDate, "days");

        petAgeDiv.innerHTML = petAge + " days old";
    } else {
        console.log("Registered date is missing or invalid.");
        petAgeDiv.innerHTML = "Registered date is missing or invalid.";
    }
}
