
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

