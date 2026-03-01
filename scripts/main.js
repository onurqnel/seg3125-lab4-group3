
document.addEventListener("DOMContentLoaded", () => {
  const stylistSelect = document.getElementById("stylist");
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  
  // off days (sunday)
  //working hours Mon-fri 9-6 and sat 10-5
  // working days for the sylist 
  const stylistOffDay = {
    "":[], // No preference 
    tina:[2],
    daniella:[1],
    laura:[5],
};
// stylist hours 
const stylistHours = {
    "": {start:9, end: 18},
    tina:{start:9, end:16},
    daniella:{start:11, end:18},
    laura: {start:9, end:18}
};
const stylistOffDates = {
    "": [],
    tina: [Monday],
    daniella: [],
    laura: []
  };

  let picker = null;

function resetTime() {
    timeSelect.innerHTML = `<option value="">Select a time</option>`;
    timeSelect.disabled = true;
  }
  function generateTimeSlots(stylistKey) {
    resetTime();
    const hours = stylistHours[stylistKey] || stylistHours[""];
    const start = hours.start;
    const end = hours.end;
    for (let h = hours.start; h < hours.end; h++) {
    const hh = String(h).padStart(2, "0");
    const time = `${hh}:00`;

    const opt = document.createElement("option");
    opt.value = time;
    opt.textContent = formatTo12Hour(time); 

    timeSelect.appendChild(opt);
}
timeSelect.disabled = false;
  }
  function isDisabledDate(dateObj, stylistKey) {
    const day = dateObj.getDay();

    // Disable weekends (Sat + Sun)
    if (day === 0 || day === 6) return true;

    // Disable stylist off-days
    const offDays = stylistOffDays[stylistKey] || [];
    if (offDays.includes(day)) return true;

    return false;
  }

  function buildPicker(stylistKey) {
    if (picker) picker.destroy();

    picker = flatpickr(dateInput, {
      dateFormat: "Y-m-d",
      minDate: "today",
      disable: [(d) => isDisabledDate(d, stylistKey)],
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) generateTimeSlots(stylistKey);
        else resetTime();
      }
    });
  }

  // Init
  resetTime();
  buildPicker(stylistSelect.value);
  stylistSelect.addEventListener("change", (e) => {
    dateInput.value = "";
    resetTime();
    buildPicker(e.target.value);
  });

  document.querySelector(".booking-form").addEventListener("submit", (e) => {
    if (!dateInput.value || !timeSelect.value) {
      e.preventDefault();
      alert("Please select an appointment date and time.");
    }
  });
});

document.getElementById('phone').addEventListener('input', function () {
  const digits = this.value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) {
    this.value = digits;
  } else if (digits.length <= 6) {
    this.value = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  } else {
    this.value = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
});

document.querySelector('.booking-form').addEventListener('submit', function (e) {
  e.preventDefault();
  let valid = true;

  // --- Full Name ---
  const nameInput = document.getElementById('fullName');
  const nameParts = nameInput.value.trim().split(/\s+/);
  if (nameParts.length < 2 || nameParts.some(p => p.length < 1)) {
    showError(nameInput, 'Please enter your first and last name.');
    valid = false;
  } else {
    clearError(nameInput);
  }

  // --- Phone ---
  const phoneInput = document.getElementById('phone');
  const digitsOnly = phoneInput.value.replace(/\D/g, '');
  if (digitsOnly.length !== 10) {
    showError(phoneInput, 'Phone number must be exactly 10 digits.');
    valid = false;
  } else {
    clearError(phoneInput);
  }

  // --- Email ---
  const emailInput = document.getElementById('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value.trim())) {
    showError(emailInput, 'Please enter a valid email address.');
    valid = false;
  } else {
    clearError(emailInput);
  }

  // --- Date: must not be in the past ---
  const dateInput = document.getElementById('date');
  const today = new Date().toISOString().split('T')[0];
  if (!dateInput.value || dateInput.value < today) {
    showError(dateInput, 'Please select a future date.');
    valid = false;
  } else {
    clearError(dateInput);
  }

  if (valid) {
    // form is good — submit or show success message
    alert('Booking submitted successfully!');
    this.reset();
  }
});

function showError(input, message) {
  clearError(input); // avoid duplicates
  input.style.borderColor = 'red';
  const error = document.createElement('span');
  error.className = 'error-msg';
  error.style.cssText = 'color:red; font-size:0.8rem; display:block; margin-top:4px;';
  error.textContent = message;
  input.parentNode.appendChild(error);
}

function clearError(input) {
  input.style.borderColor = '';
  const existing = input.parentNode.querySelector('.error-msg');
  if (existing) existing.remove();
}