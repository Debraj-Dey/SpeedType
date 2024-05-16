const _typingtext = document.querySelector(".typing-text p"),
    _inputField = document.querySelector(".input-field"),
    _mistakesField = document.querySelector(".mistakes span"),
    _WPM = document.querySelector(".wpm span"),
    _CPM = document.querySelector(".cpm span"),
    _tryAgainBtn = document.querySelector("button"),
    _accuracy = document.querySelector(".accuracy span"),
    _wordCountField = document.querySelector("#countInput"),
    _timeField = document.querySelector(".time-left");

_inputField.value = "";
let charIndex = 0, mistakesCount = 0, accuracy = 0, correctEntries = 0;
let timer, maxTime = parseInt(_timeField.querySelector("#timeInput").value), timeLeft = maxTime, isTyping = false;

async function getWords() {
    let wordCount = parseInt(_wordCountField.value);
    _wordCountField.addEventListener("change", resetGame);
    const url = `https://random-word-api.herokuapp.com/word?number=${wordCount}&length=5&lang=es`;
    const response = await fetch(url);
    return await response.json();
};

function replaceNonEnglishCharacters(paragraph) {
    // Define a regular expression to match non-English characters
    var nonEnglishRegex = /[^\x00-\x7F]/g;

    // Replace non-English characters with random lowercase English alphabet characters
    var newParagraph = paragraph.replace(nonEnglishRegex, function () {
        // Generate a random lowercase English alphabet character
        var randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
        return randomChar;
    });

    return newParagraph;
}

async function updateWordUI() {
    _typingtext.style.opacity = 0; //For smooth transition

    const result = await getWords(); //Fteching the array of words using API
    let paragraph = result.join(' '); //Converting array of words into single string

    setTimeout(() => {
        _typingtext.style.opacity = 1;
    }, 10);

    paragraph = replaceNonEnglishCharacters(paragraph);
    _typingtext.innerHTML = "";

    paragraph.split('').forEach(span => {//Taking each character inside a span tag
        let spanTag = `<span>${span}</span>`;
        _typingtext.innerHTML += spanTag

    });

    _typingtext.querySelectorAll("span")[0].classList.add("active");
    document.addEventListener("keydown", () => _inputField.focus()); //Whenver a key is pressed input field is on focus
    _typingtext.addEventListener("click", () => _inputField.focus()); //Focusing input field when clicked on the typing text
};


function initTyping() {
    const characters = document.querySelectorAll(".typing-text span");// Getting all character of the typingtext , will return an object of spans

    let typedChar = _inputField.value.split("")[charIndex];//Fetching the typed text in the input field as an array

    if (charIndex < characters.length - 1 && timeLeft > 0) {
        //So that initTimer is called only in first user input 
        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
        }

        if (typedChar == null) { //Script for backspace key
            charIndex--;

            if (characters[charIndex].classList.contains('incorrect')) {
                mistakesCount--; //Decrementing mistakes if backspace is pressed if is contains incorrect class
            }
            characters[charIndex].classList.remove("correct", "incorrect");
        } else {
            //Here characters[charIndex] is a span
            if (characters[charIndex].innerText === typedChar) {
                //If typed character is same as shown charracter then add correct class to else add incorrect class
                correctEntries++;
                characters[charIndex].classList.add("correct");
            }
            else {
                characters[charIndex].classList.add("incorrect");
                mistakesCount++; //Incrementing mistakces count if typed incorrect
            }
            charIndex++;//CharIndex will increment either user typed correct or incorrect
        }

        //This will help in pointing to the next character to be typed
        characters.forEach(span => span.classList.remove("active"));
        characters[charIndex].classList.add("active");


        let WPM = Math.round((((charIndex - mistakesCount) / 5) / (maxTime - timeLeft)) * 60);

        WPM = WPM < 0 || !WPM || WPM === Infinity ? 0 : WPM; //If WPM value is 0,empty, infinty set it to 0
        _WPM.innerText = WPM;
        _mistakesField.innerText = mistakesCount;
        _CPM.innerText = charIndex - mistakesCount;
    }
    else {
        document.querySelector(".accuracy").style.visibility = "visible";
        // _accuracy.innerText = ((correctEntries / (characters.length - 1)) * 100).toFixed(2);
        _accuracy.innerText = ((correctEntries / charIndex) * 100).toFixed(2);
        _inputField.value = "";
        clearInterval(timer);
    }
};

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        _timeField.innerHTML = "";
        _timeField.innerHTML = `Time : ${timeLeft} s`;
    }
    else {
        clearInterval(timer);
    }
}

function resetGame() {
    updateWordUI();
    _inputField.value = "";
    clearInterval(timer);
    document.querySelector(".accuracy").style.visibility = "hidden";
    accuracy = 0;
    correctEntries = 0;
    timeLeft = maxTime;
    charIndex = mistakesCount = isTyping = 0;
    _timeField.innerHTML = "";
    _timeField.innerHTML = `Time :
        <select id="timeInput" name="timeInput">
            <option value="15">15 s</option>
            <option value="30">30 s</option>
            <option value="60">60 s</option>
        </select>`;
    _mistakesField.innerText = mistakesCount;
    _WPM.innerText = 0;
    _CPM.innerText = 0;
}

updateWordUI();
_inputField.addEventListener("input", initTyping); //The input event fires when the value of an <input>, <select>, or <textarea> element has been changed as a direct result of a user action (such as typing in a textbox or checking a checkbox).
_tryAgainBtn.addEventListener("click", resetGame);