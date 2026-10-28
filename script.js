
const bmiForm = document.getElementById("bmiForm");
const result = document.getElementById("result");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

const STORAGE_KEY = "bmiCalculatorHistory";

function getHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveHistory(history) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        return true;
    } catch {
        return false;
    }
}

function displayHistory() {
    const history = getHistory();
    historyList.replaceChildren();

    if (history.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-history";
        message.textContent = "No BMI records yet. Calculate your BMI!";
        historyList.appendChild(message);
        return;
    }

    history.forEach((item) => {
        const entry = document.createElement("div");
        entry.className = "history-item";

        const details = document.createElement("div");
        details.className = "history-details";

        const bmiText = document.createElement("strong");
        bmiText.textContent = "BMI: " + item.bmi;

        const categoryText = document.createElement("span");
        categoryText.textContent = item.category;

        const dateText = document.createElement("small");
        dateText.textContent = item.date;

        details.append(bmiText, categoryText, dateText);
        entry.appendChild(details);
        historyList.appendChild(entry);
    });
}


const unitSystem = document.getElementById("unitSystem");
const metricInputs = document.getElementById("metricInputs");
const imperialInputs = document.getElementById("imperialInputs");

unitSystem.addEventListener("change", function () {
    const imperial = unitSystem.value === "imperial";

    metricInputs.hidden = imperial;
    imperialInputs.hidden = !imperial;
});

bmiForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let heightM;
    let weightKg;

    if (unitSystem.value === "metric") {
        const heightCm = Number(document.getElementById("height").value);
        weightKg = Number(document.getElementById("weight").value);

        if (
            !document.getElementById("height").value ||
            !document.getElementById("weight").value ||
            !Number.isFinite(heightCm) ||
            !Number.isFinite(weightKg) ||
            heightCm < 50 || heightCm > 300 ||
            weightKg <= 0 || weightKg > 700
        ) {
            result.textContent = "Please enter valid height and weight.";
            return;
        }

        heightM = heightCm / 100;

    } else {
        const feetInput = document.getElementById("heightFeet").value;
        const inchesInput = document.getElementById("heightInches").value;
        const poundsInput = document.getElementById("weightPounds").value;

        if (
            feetInput === "" ||
            inchesInput === "" ||
            poundsInput === ""
        ) {
            result.textContent = "Please fill in all height and weight fields.";
            return;
        }

        const feet = Number(feetInput);
        const inches = Number(inchesInput);
        const pounds = Number(poundsInput);
        const totalInches = feet * 12 + inches;

        if (
            !Number.isFinite(feet) ||
            !Number.isFinite(inches) ||
            !Number.isFinite(pounds) ||
            feet < 0 || inches < 0 || inches >= 12 ||
            totalInches < 19.7 || totalInches > 118.1 ||
            pounds <= 0 || pounds > 1543
        ) {
            result.textContent = "Please check your height and weight values.";
            return;
        }

        heightM = totalInches * 0.0254;
        weightKg = pounds * 0.45359237;
    }

    const bmi = weightKg / (heightM * heightM);
    const roundedBMI = bmi.toFixed(1);
    
const bmiGauge = document.getElementById("bmiGauge");
const gaugeMarker = document.getElementById("gaugeMarker");

bmiGauge.hidden = false;

// Cap the indicator between BMI 10 and BMI 40
const gaugePosition = Math.max(
    0,
    Math.min(100, ((bmi - 10) / 30) * 100)
);

gaugeMarker.style.left = gaugePosition + "%";


    let category;
    let color;

    if (bmi < 18.5) {
        category = "Underweight";
        color = "#3498db";
    } else if (bmi < 25) {
        category = "Normal weight";
        color = "#27ae60";
    } else if (bmi < 30) {
        category = "Overweight";
        color = "#f39c12";
    } else {
        category = "Obesity";
        color = "#e74c3c";
    }

    const minKg = 18.5 * heightM * heightM;
    const maxKg = 24.9 * heightM * heightM;

    let rangeText;

    if (unitSystem.value === "imperial") {
        rangeText =
            (minKg / 0.45359237).toFixed(1) + " – " +
            (maxKg / 0.45359237).toFixed(1) + " lb";
    } else {
        rangeText =
            minKg.toFixed(1) + " – " + maxKg.toFixed(1) + " kg";
    }

    result.style.borderTop = "3px solid " + color;
    result.style.padding = "18px 10px";
    result.style.borderRadius = "8px";
    result.style.backgroundColor = "#f8f9ff";
    result.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "Your BMI: " + roundedBMI;
    heading.style.color = color;

    const categoryLine = document.createElement("p");
    categoryLine.textContent = "Category: " + category;
    categoryLine.style.color = color;

    const rangeLine = document.createElement("p");
    rangeLine.textContent = "General adult healthy weight range: " + rangeText;

    const note = document.createElement("small");
    note.textContent = "Adult BMI is a screening measure, not a diagnosis.";

    result.append(heading, categoryLine, rangeLine, note);

    const history = getHistory();
    history.unshift({
        bmi: roundedBMI,
        category: category,
        date: new Date().toLocaleString()
    });

    if (saveHistory(history)) {
        displayHistory();
    } else {
        const warning = document.createElement("p");
        warning.textContent = "History could not be saved.";
        result.appendChild(warning);
    }
});

displayHistory();

