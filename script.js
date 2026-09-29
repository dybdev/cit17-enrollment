// ========== VARIABLES ==========
let currentStep = 1; // the step the student is on
const totalSteps = 5;

const form = document.getElementById("enrollForm");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const courseSelect = document.getElementById("course");
const majorBox = document.getElementById("majorBox");

// ========== HELPER FUNCTIONS ==========

// Get the text a student typed (without extra spaces)
function getValue(id) {
  return document.getElementById(id).value.trim();
}

// Show a red error message under a field
function showError(id, message) {
  document.getElementById(id).classList.add("input-error");
  document.getElementById(id + "Error").textContent = message;
}

// Remove the error message under a field
function clearError(id) {
  document.getElementById(id).classList.remove("input-error");
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

// ========== VALIDATION FOR EACH STEP ==========
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

// ========== SHOW A STEP ==========
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

// ========== COLLECT THE STUDENT'S DATA ==========
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

// ========== REVIEW STEP ==========
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

// ========== ADD STUDENT TO THE TABLE ==========
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

// ========== BUTTON CLICKS ==========
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

// Show the Major dropdown only for BSIT
courseSelect.addEventListener("change", () => {
  if (courseSelect.value === "BSIT") {
    majorBox.classList.remove("hidden");
  } else {
    majorBox.classList.add("hidden");
    document.getElementById("major").value = "";
    clearError("major");
  }
});

// Clear a field's error as soon as the student types or picks something
document.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("input", () => clearError(field.id));
});

// Start on step 1
showStep(currentStep);
