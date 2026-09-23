const form = document.querySelector("#enrollment-form");
const panels = [...document.querySelectorAll("[data-panel]")];
const stepButtons = [...document.querySelectorAll("[data-step]")];
const titles = [
  "Let’s start with you.",
  "What’s your name?",
  "Let’s stay connected.",
  "Choose your path.",
  "Ready for your next chapter?",
];
const fields = [...form.querySelectorAll("input, select")];
const course = document.querySelector("#course");
const major = document.querySelector("#major");
let currentStep = 0;
let enrollmentCount = 0;

function clearError(field) {
  field.removeAttribute("aria-invalid");
  document.querySelector(`#${field.id}-error`).textContent = "";
}
function validateField(field) {
  clearError(field);
  if (field.disabled) return true;
  const value = field.value.trim();
  let message = "";
  if (field.required && !value) message = "Please complete this field.";
  else if (value && field.minLength > 0 && value.length < field.minLength)
    message = `Enter at least ${field.minLength} characters.`;
  else if (
    field.type === "email" &&
    value &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  )
    message = "Enter a valid email address, such as you@example.com.";
  else if (
    field.tagName === "SELECT" &&
    value &&
    ![...field.options].some((option) => option.value === value)
  )
    message = "Please select an available option.";
  if (message) {
    field.setAttribute("aria-invalid", "true");
    document.querySelector(`#${field.id}-error`).textContent = message;
  }
  return !message;
}
function validateStep(step) {
  const results = [...panels[step].querySelectorAll("input, select")].map(
    validateField,
  );
  const valid = results.every(Boolean);
  if (!valid) panels[step].querySelector('[aria-invalid="true"]').focus();
  return valid;
}
function enrollmentData() {
  const values = Object.fromEntries(
    fields.map((field) => [field.name, field.value.trim()]),
  );
  return {
    "Student ID": values.studentId,
    Name: [
      values.prefix,
      values.firstName,
      values.middleName,
      values.lastName,
      values.suffix,
    ]
      .filter(Boolean)
      .join(" "),
    Email: values.email,
    Course: values.course,
    Major: values.course === "BSIT" ? values.major : "—",
    "Year level": values.year,
  };
}
function renderReview() {
  const review = document.querySelector("#review-details");
  review.replaceChildren();
  Object.entries(enrollmentData()).forEach(([label, value]) => {
    const group = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value;
    group.append(term, detail);
    review.append(group);
  });
}
function showStep(step, focus = true) {
  currentStep = step;
  panels.forEach((panel, index) => {
    panel.hidden = index !== step;
  });
  stepButtons.forEach((button, index) => {
    button.classList.toggle("complete", index < step);
    if (index === step) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  document.querySelector("#step-count").textContent = `STEP 0${step + 1} / 05`;
  document.querySelector("#step-title").textContent = titles[step];
  document.querySelector("#back").disabled = step === 0;
  document.querySelector("#next").innerHTML =
    step === 4
      ? 'Submit enrollment <span aria-hidden="true">↗</span>'
      : 'Continue <span aria-hidden="true">↗</span>';
  if (step === 4) renderReview();
  if (focus) document.querySelector("#step-title").focus();
}
function updateMajor() {
  const isBSIT = course.value === "BSIT";
  document.querySelector("#major-field").hidden = !isBSIT;
  major.disabled = !isBSIT;
  major.required = isBSIT;
  if (!isBSIT) {
    major.value = "";
    clearError(major);
  }
}
fields.forEach((field) => {
  field.addEventListener("input", () => clearError(field));
  field.addEventListener("change", () => clearError(field));
});
course.addEventListener("change", updateMajor);
document.querySelector("#back").addEventListener("click", () => {
  if (currentStep > 0) showStep(currentStep - 1);
});
stepButtons.forEach((button) =>
  button.addEventListener("click", () => {
    const target = Number(button.dataset.step);
    if (target > currentStep) {
      for (let step = 0; step < target; step++) {
        showStep(step, false);
        if (!validateStep(step)) return;
      }
    }
    showStep(target);
  }),
);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#success-message").hidden = true;
  if (!validateStep(currentStep)) return;
  if (currentStep < 4) {
    showStep(currentStep + 1);
    return;
  }
  for (let step = 0; step < 4; step++) {
    showStep(step, false);
    if (!validateStep(step)) return;
  }
  const row = document.createElement("tr");
  Object.values(enrollmentData()).forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  });
  document.querySelector("#emptyRow")?.remove();
  document.querySelector("#studentTableBody").append(row);
  enrollmentCount++;
  document.querySelector("#record-count").textContent =
    `${enrollmentCount} enrollment${enrollmentCount === 1 ? "" : "s"}`;
  form.reset();
  updateMajor();
  fields.forEach(clearError);
  showStep(0);
  const success = document.querySelector("#success-message");
  success.textContent =
    "Enrollment submitted successfully! Your details are in the student records below.";
  success.hidden = false;
});
updateMajor();
showStep(0, false);
