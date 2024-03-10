const animator = document.getElementById("pet-animator");
var pet = undefined;
var animId = 0;

async function displayAnimation(type) {
    if(pet === undefined) {
        const response = await fetch("/api/pet");
        pet = (await response.json()).pet;
    }

    animId += 1;
    var id = animId
    console.log("Playing " + type + " for " + pet);

    if(pet == "unknown") pet = "Cat";
    switch(type) {
        case "play":
            animator.src = ("/images/" + pet + "Jump.gif");
            setTimeout(function() {resetAnimation(id)}, 5000);
            break;
        case "eat":
            animator.src = ("/images/" + pet + "Eat.gif");
            setTimeout(function() {resetAnimation(id)}, 5000);
            break;
        case "sleep":
            animator.src = ("/images/" + pet + "Sleep.gif");
            break;
        default:
            resetAnimation();
    }
}

function resetAnimation(id) {
    if(id === undefined || id >= animId)
    {
        animator.src = ("/images/" + pet + "Idle.gif");
    }
}

displayAnimation("none");