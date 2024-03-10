async function feed() {
    const response = await fetch(`/api/eat`);
    var parsed = await response.json();
    if(parsed.result != null)
    {
        switch(parsed.result) {
            case "fed":
                updateDisplay();
                break;
        }
    }
}

async function play() {
    const response = await fetch(`/api/play`);
    var parsed = await response.json();
    if(parsed.result != null)
    {
        switch(parsed.result) {
            case "played":
                updateDisplay();
                break;
        }
    }
}

function sleep() {

}