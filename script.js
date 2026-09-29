//VARIABLES
let currentStep = 1; // the step the student is on
const totalSteps = 5;

const form = document.getElementById("enrollForm");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const majorBox = document.getElementById("majorBox");

//HELPER FUNCTIONS

// Get the text a student typed (without extra spaces)
function getValue(id) {
  return document.getElementById(id).value.trim();
}

// The part of a field that gets the red border.
// For our custom dropdowns, that is the whole .dropdown box.
function getFieldBox(id) {
  const field = document.getElementById(id);
  if (field.type === "hidden") {
    return field.parentElement;
  }
  return field;
}

// Show a red error message under a field
function showError(id, message) {
  getFieldBox(id).classList.add("input-error");
  document.getElementById(id + "Error").textContent = message;
}

// Remove the error message under a field
function clearError(id) {
  getFieldBox(id).classList.remove("input-error");
  document.getElementById(id + "Error").textContent = "";
}

// Check a required field. Returns true if it is OK.
function checkRequired(id, minLength) {
  const value = getValue(id);
  if (value === "") {
    showError(id, "This field is required.");
    return false;
  }
  if (value.length < minLength) {
    showError(id, "Must be at least " + minLength + " characters.");
    return false;
  }
  clearError(id);
  return true;
}

// Check an optional field. Empty is OK, but if filled it needs minLength.
function checkOptional(id, minLength) {
  const value = getValue(id);
  if (value !== "" && value.length < minLength) {
    showError(id, "Must be at least " + minLength + " characters.");
    return false;
  }
  clearError(id);
  return true;
}

//VALIDATION FOR EACH STEP
function validateStep(step) {
  if (step === 1) {
    return checkRequired("studentId", 5);
  }

  if (step === 2) {
    // Run every check so all errors show at once
    const prefixOk = checkOptional("prefix", 2);
    const firstOk = checkRequired("firstName", 3);
    const middleOk = checkOptional("middleName", 2);
    const lastOk = checkRequired("lastName", 2);
    const suffixOk = checkOptional("suffix", 2);
    return prefixOk && firstOk && middleOk && lastOk && suffixOk;
  }

  if (step === 3) {
    const email = getValue("email");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") {
      showError("email", "This field is required.");
      return false;
    }
    if (!emailPattern.test(email)) {
      showError("email", "Please enter a valid email (you@example.com).");
      return false;
    }
    clearError("email");
    return true;
  }

  if (step === 4) {
    const courseOk = checkRequired("course", 1);
    const yearOk = checkRequired("year", 1);
    let majorOk = true;
    if (getValue("course") === "BSIT") {
      majorOk = checkRequired("major", 1);
    }
    return courseOk && majorOk && yearOk;
  }

  return true; // step 5 (review) has nothing to check
}

//SHOW A STEP
function showStep(step) {
  // Hide all steps, then show the current one
  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById("step" + i).classList.add("hidden");
  }
  document.getElementById("step" + step).classList.remove("hidden");

  // Update the "Step X of 5" text and the progress bar
  document.getElementById("stepText").textContent =
    "Step " + step + " of " + totalSteps;
  document.getElementById("progressFill").style.width =
    (step / totalSteps) * 100 + "%";

  // Hide Back on step 1, and change Next to Submit on the last step
  backBtn.style.visibility = step === 1 ? "hidden" : "visible";
  nextBtn.textContent = step === totalSteps ? "Submit" : "Next";

  if (step === totalSteps) {
    showReview();
  }
}

//COLLECT THE STUDENT'S DATA
function getStudent() {
  // Join the name parts, skipping empty ones
  const nameParts = [
    getValue("prefix"),
    getValue("firstName"),
    getValue("middleName"),
    getValue("lastName"),
    getValue("suffix"),
  ];
  const fullName = nameParts.filter((part) => part !== "").join(" ");

  return {
    studentId: getValue("studentId"),
    name: fullName,
    email: getValue("email"),
    course: getValue("course"),
    major: getValue("course") === "BSIT" ? getValue("major") : "N/A",
    year: getValue("year"),
  };
}

//REVIEW STEP
function showReview() {
  const student = getStudent();
  const reviewBox = document.getElementById("reviewBox");

  reviewBox.innerHTML = "";
  addReviewItem(reviewBox, "Student ID", student.studentId);
  addReviewItem(reviewBox, "Name", student.name);
  addReviewItem(reviewBox, "Email", student.email);
  addReviewItem(reviewBox, "Course", student.course);
  addReviewItem(reviewBox, "Major", student.major);
  addReviewItem(reviewBox, "Year Level", student.year);
}

function addReviewItem(box, label, value) {
  const row = document.createElement("div");
  row.className = "review-item";

  const labelEl = document.createElement("span");
  labelEl.textContent = label;

  const valueEl = document.createElement("strong");
  valueEl.textContent = value;

  row.append(labelEl, valueEl);
  box.append(row);
}

//ADD STUDENT TO THE TABLE
function addToTable(student) {
  // Remove the "No students yet" row the first time
  const emptyRow = document.getElementById("emptyRow");
  if (emptyRow) {
    emptyRow.remove();
  }

  const row = document.createElement("tr");
  const values = [
    student.studentId,
    student.name,
    student.email,
    student.course,
    student.major,
    student.year,
  ];
  values.forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  });

  document.getElementById("studentTable").append(row);
}

// BUTTON CLICKS
// The Next button is a submit button, so clicking it
// (or pressing Enter in a field) runs this code
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  document.getElementById("successMsg").classList.add("hidden");

  // Stop if the current step has errors
  if (!validateStep(currentStep)) {
    return;
  }

  // Go to the next step
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
    return;
  }

  // Last step: submit the enrollment
  addToTable(getStudent());
  form.reset();
  resetDropdown("course");
  resetDropdown("major");
  resetDropdown("year");
  majorBox.classList.add("hidden");
  currentStep = 1;
  showStep(currentStep);
  document.getElementById("successMsg").classList.remove("hidden");
});

backBtn.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
});

// CUSTOM DROPDOWNS
// Each dropdown has: a hidden input (stores the value),
// a button (shows the choice) and a list of option buttons.

// Open or close one dropdown
function toggleDropdown(dropdown) {
  const isOpen = dropdown.classList.contains("open");
  closeAllDropdowns();
  if (!isOpen) {
    dropdown.classList.add("open");
  }
}

function closeAllDropdowns() {
  document.querySelectorAll(".dropdown.open").forEach((dropdown) => {
    dropdown.classList.remove("open");
  });
}

// Save the clicked option into the dropdown
function selectOption(dropdown, option) {
  const hiddenInput = dropdown.querySelector("input");
  hiddenInput.value = option.dataset.value;
  dropdown.querySelector(".dropdown-text").textContent = option.textContent;
  dropdown.classList.add("has-value");

  // Highlight only the chosen option
  dropdown.querySelectorAll(".dropdown-list button").forEach((button) => {
    button.classList.remove("selected");
  });
  option.classList.add("selected");

  clearError(hiddenInput.id);
  dropdown.classList.remove("open");
  dropdown.querySelector(".dropdown-button").focus();

  if (hiddenInput.id === "course") {
    updateMajor();
  }
}

// Put a dropdown back to "Select ..." with nothing chosen
function resetDropdown(id) {
  const hiddenInput = document.getElementById(id);
  const dropdown = hiddenInput.parentElement;
  const text = dropdown.querySelector(".dropdown-text");

  hiddenInput.value = "";
  text.textContent = text.dataset.placeholder;
  dropdown.classList.remove("has-value");
  dropdown.querySelectorAll(".dropdown-list button").forEach((button) => {
    button.classList.remove("selected");
  });
  clearError(id);
}

// Show the Major dropdown only for BSIT
function updateMajor() {
  if (getValue("course") === "BSIT") {
    majorBox.classList.remove("hidden");
  } else {
    majorBox.classList.add("hidden");
    resetDropdown("major");
  }
}

// Set up the clicks for every dropdown on the page
document.querySelectorAll(".dropdown").forEach((dropdown) => {
  const text = dropdown.querySelector(".dropdown-text");
  text.dataset.placeholder = text.textContent; // remember "Select ..."

  const button = dropdown.querySelector(".dropdown-button");
  const options = dropdown.querySelectorAll(".dropdown-list button");

  button.addEventListener("click", () => {
    toggleDropdown(dropdown);
  });

  // Arrow Down on the dropdown opens it and jumps to the first option
  button.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      closeAllDropdowns();
      dropdown.classList.add("open");
      options[0].focus();
    }
  });

  options.forEach((option, index) => {
    option.addEventListener("click", () => selectOption(dropdown, option));

    // Arrow keys move up and down the list
    option.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" && index < options.length - 1) {
        event.preventDefault();
        options[index + 1].focus();
      }
      if (event.key === "ArrowUp" && index > 0) {
        event.preventDefault();
        options[index - 1].focus();
      }
    });
  });
});

// Close dropdowns when clicking anywhere else
document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) {
    closeAllDropdowns();
  }
});

// Close dropdowns with the Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAllDropdowns();
  }
});

// Clear a field's error as soon as the student types something
document.querySelectorAll("input").forEach((field) => {
  field.addEventListener("input", () => clearError(field.id));
});

// Start on step 1
showStep(currentStep);
