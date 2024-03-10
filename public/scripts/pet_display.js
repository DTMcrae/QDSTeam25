const animator = document.getElementById("pet-animator");
var pet = undefined;

async function displayAnimation(type) {
    if(pet === undefined) {
        const response = await fetch("/api/pet");
        pet = (await response.json()).pet;
    }

    if(pet == "unknown") pet = "Cat";
    switch(type) {
        case "play":
            animator.src = ("/images/" + pet + "Jump.gif");
            setTimeout(resetAnimation, 5000);
            break;
        case "eat":
            animator.src = ("/images/" + pet + "Eat.gif");
            setTimeout(resetAnimation, 5000);
            break;
        case "sleep":
            animator.src = ("/images/" + pet + "Sleep.gif");
            break;
        default:
            resetAnimation();
    }
}

function resetAnimation() {
    animator.src = ("/images/" + pet + "Idle.gif");
}

displayAnimation("none");