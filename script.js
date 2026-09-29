const form = document.querySelector("#enrollment-form");
const panels = [...document.querySelectorAll("[data-panel]")];
const stepButtons = [...document.querySelectorAll("[data-step]")];
const titles = [
  "Let’s start with you",
  "What’s your name?",
  "How can we reach you?",
  "Pick your program",
  "Almost done!",
];
const labels = ["Student ID", "Your name", "Contact", "Program", "Review"];
const inputs = [...form.querySelectorAll('input:not([type="radio"])')];
const groups = [...form.querySelectorAll(".choice-group")];
const majorGroup = document.querySelector("#major");
const lastStep = panels.length - 1;
let currentStep = 0;
let enrollmentCount = 0;

function setError(target, message) {
  const error = document.querySelector(`#${target.id}-error`);
  error.textContent = message;
  if (message) target.setAttribute("aria-invalid", "true");
  else target.removeAttribute("aria-invalid");
}
function checkedValue(group) {
  return group.querySelector("input:checked")?.value ?? "";
}
function validateInput(input) {
  const value = input.value.trim();
  let message = "";
  if (input.required && !value) message = "Please fill this in.";
  else if (value && input.minLength > 0 && value.length < input.minLength)
    message = `Needs at least ${input.minLength} characters.`;
  else if (
    input.type === "email" &&
    value &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  )
    message = "That doesn’t look like an email. Try you@example.com.";
  setError(input, message);
  return !message;
}
function validateGroup(group) {
  const message =
    !group.hidden && !checkedValue(group)
      ? `Please choose your ${group.dataset.label}.`
      : "";
  setError(group, message);
  return !message;
}
function validateStep(step) {
  const panel = panels[step];
  const results = [
    ...inputs.filter((input) => panel.contains(input)).map(validateInput),
    ...groups.filter((group) => panel.contains(group)).map(validateGroup),
  ];
  const valid = results.every(Boolean);
  if (!valid) {
    const invalid = panel.querySelector('[aria-invalid="true"]');
    invalid.closest("details")?.setAttribute("open", "");
    (invalid.matches("fieldset")
      ? invalid.querySelector("input")
      : invalid
    ).focus();
  }
  return valid;
}
function enrollmentData() {
  const values = Object.fromEntries(
    [...new FormData(form)].map(([key, value]) => [key, value.trim()]),
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
const reviewSteps = {
  "Student ID": 0,
  Name: 1,
  Email: 2,
  Course: 3,
  Major: 3,
  "Year level": 3,
};
function renderReview() {
  const review = document.querySelector("#review-details");
  review.replaceChildren();
  Object.entries(enrollmentData()).forEach(([label, value]) => {
    if (label === "Major" && value === "—") return;
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    const edit = document.createElement("button");
    term.textContent = label;
    detail.textContent = value;
    edit.type = "button";
    edit.className = "edit-button";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", `Edit ${label}`);
    edit.addEventListener("click", () => showStep(reviewSteps[label]));
    row.append(term, detail, edit);
    review.append(row);
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
  document.querySelector("#step-count").textContent =
    `Step ${step + 1} of ${panels.length}`;
  document.querySelector("#step-label").textContent = labels[step];
  document.querySelector("#progress-fill").style.width =
    `${((step + 1) / panels.length) * 100}%`;
  document
    .querySelector(".progress-track")
    .setAttribute("aria-valuenow", step + 1);
  document.querySelector("#step-title").textContent = titles[step];
  document.querySelector("#back").disabled = step === 0;
  document.querySelector("#next").textContent =
    step === lastStep ? "Submit enrollment" : "Continue";
  if (step === lastStep) renderReview();
  if (focus) document.querySelector("#step-title").focus();
}
function updateMajor() {
  const isBSIT = checkedValue(document.querySelector("#course")) === "BSIT";
  majorGroup.hidden = !isBSIT;
  if (!isBSIT) {
    majorGroup.querySelectorAll("input").forEach((radio) => {
      radio.checked = false;
    });
    setError(majorGroup, "");
  }
}
inputs.forEach((input) =>
  input.addEventListener("input", () => setError(input, "")),
);
groups.forEach((group) =>
  group.addEventListener("change", () => setError(group, "")),
);
document.querySelector("#course").addEventListener("change", updateMajor);
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
  if (currentStep < lastStep) {
    showStep(currentStep + 1);
    return;
  }
  for (let step = 0; step < lastStep; step++) {
    showStep(step, false);
    if (!validateStep(step)) return;
  }
  const data = enrollmentData();
  const row = document.createElement("tr");
  Object.entries(data).forEach(([label, value]) => {
    const cell = document.createElement("td");
    cell.dataset.label = label;
    cell.textContent = value;
    row.append(cell);
  });
  document.querySelector("#emptyRow")?.remove();
  document.querySelector("#studentTableBody").append(row);
  enrollmentCount++;
  document.querySelector("#record-count").textContent =
    `${enrollmentCount} enrollment${enrollmentCount === 1 ? "" : "s"}`;
  document.querySelector("#record-badge").textContent = enrollmentCount;
  form.reset();
  updateMajor();
  inputs.forEach((input) => setError(input, ""));
  groups.forEach((group) => setError(group, ""));
  showStep(0);
  const success = document.querySelector("#success-message");
  success.textContent = `🎉 You’re enrolled, ${data.Name}! Your details are saved in My records below.`;
  success.hidden = false;
});
updateMajor();
showStep(0, false);
