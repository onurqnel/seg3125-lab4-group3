document.addEventListener("DOMContentLoaded", () => {

  // ── Helpers ──────────────────────────────────────────────────────────────
  function showError(input, message) {
    clearError(input);
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

  // ── Phone auto-format ─────────────────────────────────────────────────────
  document.getElementById('phone').addEventListener('input', function () {
    const digits = this.value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) {
      this.value = digits;
    } else if (digits.length <= 6) {
      this.value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      this.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
  });

  // ── Card number auto-format (groups of 4) ────────────────────────────────
  document.getElementById('cardNumber').addEventListener('input', function () {
    const digits = this.value.replace(/\D/g, '').slice(0, 16);
    this.value = digits.replace(/(.{4})/g, '$1 ').trim();
  });

  // ── Expiry auto-format (MM/YY) ───────────────────────────────────────────
  document.getElementById('cardExpiry').addEventListener('input', function () {
    const digits = this.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) {
      this.value = digits;
    } else {
      this.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
  });

  // ── CSC: digits only ─────────────────────────────────────────────────────
  document.getElementById('cardCsc').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 4);
  });

  // ── Date Picker (Flatpickr) ──────────────────────────────────────────────
  const dateInputEl = document.getElementById('date');
  const stylistSelect = document.getElementById('stylist');

  // Off-days setup (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const stylistOffDays = {
    'Tina': [1],        // Tina is off on Mondays
    'Daniella': [2],    // Daniella is off on Tuesdays
    'Laura': [3]        // Laura is off on Wednesdays
  };

  const fp = flatpickr(dateInputEl, {
    minDate: "today",
    disable: [
      function (date) {
        // Disable weekends
        const day = date.getDay();
        if (day === 0 || day === 6) {
          return true;
        }

        // Disable specific stylist's off-days
        const selectedStylist = stylistSelect.value;
        if (selectedStylist && stylistOffDays[selectedStylist]) {
          return stylistOffDays[selectedStylist].includes(day);
        }

        return false;
      }
    ]
  });

  // Update flatpickr when the stylist changes
  stylistSelect.addEventListener('change', function () {
    fp.redraw();

    // Clear selection if now disabled
    if (fp.selectedDates.length > 0) {
      const selectedDay = fp.selectedDates[0].getDay();
      const currentStylist = this.value;
      if (stylistOffDays[currentStylist] && stylistOffDays[currentStylist].includes(selectedDay)) {
        fp.clear();
      }
    }
  });

  // ── Booking form ─────────────────────────────────────────────────────────
  // Store booking summary to use later in confirmation
  let bookingSummary = {};

  document.querySelector('.booking-form').addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    // Full Name
    const nameInput = document.getElementById('fullName');
    const nameParts = nameInput.value.trim().split(/\s+/);
    if (nameParts.length < 2 || nameParts.some(p => p.length < 1)) {
      showError(nameInput, 'Please enter your first and last name.');
      valid = false;
    } else {
      clearError(nameInput);
    }

    // Phone
    const phoneInput = document.getElementById('phone');
    const digitsOnly = phoneInput.value.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      showError(phoneInput, 'Phone number must be exactly 10 digits.');
      valid = false;
    } else {
      clearError(phoneInput);
    }

    // Email
    const emailInput = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(emailInput);
    }

    // Date & Time
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const today = new Date().toISOString().split('T')[0];

    if (!dateInput.value || dateInput.value < today) {
      showError(dateInput, 'Please select a valid future date.');
      valid = false;
    } else {
      const selected = new Date(dateInput.value + 'T00:00:00');
      const day = selected.getDay();

      if (day === 0) {
        showError(dateInput, 'We are closed on Sundays.');
        valid = false;
      } else {
        clearError(dateInput);
        if (timeInput && timeInput.value) {
          const timeHour = parseInt(timeInput.value.split(':')[0], 10);
          const timeMin = parseInt(timeInput.value.split(':')[1], 10);

          if (day === 6) {
            // Sat: 10am - 5pm
            if (timeHour < 10 || timeHour > 17 || (timeHour === 17 && timeMin > 0)) {
              showError(timeInput, 'Saturday hours: 10:00 AM - 5:00 PM');
              valid = false;
            } else {
              clearError(timeInput);
            }
          } else {
            // Mon - Fri: 9am - 6pm
            if (timeHour < 9 || timeHour > 18 || (timeHour === 18 && timeMin > 0)) {
              showError(timeInput, 'Weekday hours: 9:00 AM - 6:00 PM');
              valid = false;
            } else {
              clearError(timeInput);
            }
          }
        }
      }
    }

    if (valid) {
      // Save summary for confirmation screen
      const stylistVal = document.getElementById('stylist').value;
      const serviceVal = document.getElementById('service').value;

      let formattedTime = '';
      if (timeInput && timeInput.value) {
        let [hh, mm] = timeInput.value.split(':');
        let hour = parseInt(hh, 10);
        let ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        formattedTime = ` at ${hour}:${mm} ${ampm}`;
      }

      bookingSummary = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        service: serviceVal || 'Not selected',
        stylist: stylistVal || 'No preference',
        date: dateInput.value + formattedTime
      };

      // Hide booking, show payment
      document.getElementById('booking').style.display = 'none';
      document.getElementById('payment').style.display = 'block';
      document.getElementById('payment').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // ── Payment form ──────────────────────────────────────────────────────────
  document.querySelector('.payment-form').addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    // Name on card
    const cardName = document.getElementById('cardName');
    const cardNameParts = cardName.value.trim().split(/\s+/);
    if (cardNameParts.length < 2) {
      showError(cardName, 'Please enter the full name as it appears on your card.');
      valid = false;
    } else {
      clearError(cardName);
    }

    // Card number (must be 16 digits)
    const cardNumber = document.getElementById('cardNumber');
    const cardDigits = cardNumber.value.replace(/\D/g, '');
    if (cardDigits.length !== 16) {
      showError(cardNumber, 'Card number must be 16 digits.');
      valid = false;
    } else {
      clearError(cardNumber);
    }

    // Expiry (MM/YY, not in the past)
    const cardExpiry = document.getElementById('cardExpiry');
    const expiryMatch = cardExpiry.value.match(/^(\d{2})\/(\d{2})$/);
    let expiryValid = false;
    if (expiryMatch) {
      const month = parseInt(expiryMatch[1]);
      const year = 2000 + parseInt(expiryMatch[2]);
      const now = new Date();
      const expDate = new Date(year, month - 1, 1); // first of expiry month
      if (month >= 1 && month <= 12 && expDate >= new Date(now.getFullYear(), now.getMonth(), 1)) {
        expiryValid = true;
      }
    }
    if (!expiryValid) {
      showError(cardExpiry, 'Please enter a valid expiry date (MM/YY).');
      valid = false;
    } else {
      clearError(cardExpiry);
    }

    // CSC (3 or 4 digits)
    const cardCsc = document.getElementById('cardCsc');
    if (!/^\d{3,4}$/.test(cardCsc.value)) {
      showError(cardCsc, 'CSC must be 3 or 4 digits.');
      valid = false;
    } else {
      clearError(cardCsc);
    }

    if (valid) {
      // Hide payment, show confirmation
      document.getElementById('payment').style.display = 'none';
      document.getElementById('confirmation').style.display = 'block';

      // Populate confirmation details
      const detailsList = document.getElementById('confirmation-details');
      detailsList.innerHTML = `
        <li><strong>Name:</strong> ${bookingSummary.name}</li>
        <li><strong>Email:</strong> ${bookingSummary.email}</li>
        <li><strong>Phone:</strong> ${bookingSummary.phone}</li>
        <li><strong>Service:</strong> ${bookingSummary.service}</li>
        <li><strong>Stylist:</strong> ${bookingSummary.stylist}</li>
        <li><strong>Date:</strong> ${bookingSummary.date}</li>
      `;

      document.getElementById('confirmation').scrollIntoView({ behavior: 'smooth' });
    }
  });

});