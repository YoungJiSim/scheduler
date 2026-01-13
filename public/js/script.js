const API_URL = "http://localhost:3000";

init();

function init() {
  const today = new Date();
  drawCalendar(today);

  // change month
  const monthBtns = document.getElementsByClassName("monthBtns");
  for (let monthBtn of monthBtns) {
    monthBtn.addEventListener("click", (event) => {
      changeMonth(event.currentTarget);
    });
  }

  // back to today's calendar
  const todayBtn = document.getElementById("todayBtn");
  todayBtn.addEventListener("click", () => {
    drawCalendar(today);
    drawSchedulesOnCalendar(today);
  });

  // draw schedules to the calendar
  drawSchedulesOnCalendar(today);

  // open schedule modal
  const addScheduleBtn = document.getElementById("addScheduleBtn");
  addScheduleBtn.addEventListener("click", (event) => {
    openScheduleModal("scheduleModal", event);
  });

  // add schedule to DB
  const scheduleModalSubmitBtn = document.getElementById(
    "scheduleModalSubmitBtn"
  );
  scheduleModalSubmitBtn.addEventListener("click", addSchedule);
}

function drawCalendar(baseDate) {
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // reset Calendar
  let temp = document.getElementById("calendar");
  for (let i = temp.children.length - 1; i >= 0; i--) {
    temp.children[i].remove();
  }

  // get basic data for the month
  const monthString = MONTHS[baseDate.getMonth()];
  const firstDay = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    1
  ).getDay();
  const lastDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    0
  ).getDate();

  // set year and month to the page
  const currentYear = baseDate.getFullYear();
  document.getElementById("calendarYear").innerText = currentYear;
  document.getElementById("calendarMonth").innerText = monthString;

  // count how many week sections are needed
  let weekCount = 0;
  // February
  if (lastDate % 7 == 0) {
    if (firstDay == 0) {
      weekCount = 4;
    } else {
      weekCount = 5;
    }
    // other months
  } else {
    if (firstDay + (lastDate % 7) > 7) {
      weekCount = 6;
    } else {
      weekCount = 5;
    }
  }

  const calendarTable = document.getElementById("calendar");
  let dateCount = 1;
  for (let i = 0; i < weekCount + 1; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < DAYS.length; j++) {
      const td = document.createElement("td");

      // draw days header to the calendar
      if (i == 0) {
        const th = document.createElement("th");
        th.id = DAYS[j];
        th.innerText = DAYS[j];
        tr.append(th);

        // draw the first week of the month
      } else if (i == 1) {
        if (j >= firstDay) {
          td.id =
            baseDate.getFullYear().toString() +
            "-" +
            (baseDate.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            dateCount.toString().padStart(2, "0");
          td.innerHTML = `<div class="calendarDateDivs">${dateCount}</div>`;
          dateCount++;
        }
        tr.append(td);

        // draw the other weeks
      } else {
        if (lastDate >= dateCount) {
          td.id =
            baseDate.getFullYear().toString() +
            "-" +
            (baseDate.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            dateCount.toString().padStart(2, "0");
          td.innerHTML = `<div class="calendarDateDivs">${dateCount}</div>`;
          dateCount++;
        }
        tr.append(td);
      }
      calendarTable.append(tr);
    }
  }
}

function changeMonth(self) {
  // to convert month string to int
  const monthMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const btnMap = {
    prevMonth: -1,
    nextMonth: 1,
  };

  const btnId = self.id;
  const calendarMonthString =
    document.getElementById("calendarMonth").innerText;
  const calendarYear = parseInt(
    document.getElementById("calendarYear").innerText
  );

  let baseDate = new Date();
  baseDate.setDate(1);
  // set the year and month from the calendar
  baseDate.setFullYear(calendarYear);
  baseDate.setMonth(monthMap[calendarMonthString]);

  // change the month and redraw the calendar
  baseDate.setMonth(baseDate.getMonth() + btnMap[btnId]);
  drawCalendar(baseDate);
  drawSchedulesOnCalendar(baseDate);
}

async function getSchedules() {
  const response = await $.ajax({
    url: `${API_URL}/schedules`,
    error: (error) => console.log(error),
  });
  return response;
}

async function drawSchedulesOnCalendar(baseDate) {
  const schedules = await getSchedules();
  if (!schedules) return;

  const baseYear = baseDate.getFullYear();
  const baseMonth = baseDate.getMonth() + 1;

  schedules.forEach((schedule) => {
    const scheduleId = schedule.scheduleId;
    const title = schedule.title;
    const startDate = schedule.startDate;

    const targetTd = document.getElementById(startDate);
    if (targetTd) {
      const scheduleTitleDiv = document.createElement("div");
      scheduleTitleDiv.className = "scheduleTitleDivs";
      scheduleTitleDiv.innerHTML = `<button id="${scheduleId}" class="btn btn-sm" onClick="openScheduleModal('scheduleModal', event)">${title}</button>`;
      targetTd.append(scheduleTitleDiv);
    }
  });
}

function openScheduleModal(modalId, event) {
  // control modal
  const scheduleModal = new bootstrap.Modal(`#${modalId}`);
  scheduleModal.show();

  // close modal
  const modalCloseBtn = document.getElementById("scheduleModalCloseBtn");
  modalCloseBtn.addEventListener("click", () => {
    document.getElementById("scheduleForm").reset();
    makeScheduleEditable();
    scheduleModal.hide();
  });

  // btn controls
  const btnId = event.target.id;
  modalBtnsControl(btnId);

  if (btnId != "addScheduleBtn") {
    // show schedule
    showScheduleOnModal(btnId);

    // edit schedule
    const scheduleModalEditBtn = document.getElementById(
      "scheduleModalEditBtn"
    );
    scheduleModalEditBtn.addEventListener("click", makeScheduleEditable);

    // cancel editing
    const scheduleModalCancelBtn = document.getElementById(
      "scheduleModalCancelBtn"
    );
    scheduleModalCancelBtn.addEventListener("click", () => {
      modalCloseBtn.click();
      openScheduleModal(modalId, event);
    });

    // update schedule to DB
    const scheduleModalEditSaveBtn = document.getElementById(
      "scheduleModalEditSaveBtn"
    );
    scheduleModalEditSaveBtn.addEventListener("click", () =>
      updateSchedule(btnId)
    );

    // delete schedule
    const scheduleModalDeleteBtn = document.getElementById(
      "scheduleModalDeleteBtn"
    );
    scheduleModalDeleteBtn.addEventListener("click", () =>
      deleteSchedule(btnId)
    );
  }
}

function modalBtnsControl(modalBtnId) {
  const modalAddScheduleBtns = document.getElementById("modalAddScheduleBtns");
  const modalShowScheduleBtnsDiv = document.getElementById(
    "modalShowScheduleBtnsDiv"
  );
  const modalUpdateScheduleBtnsDiv = document.getElementById(
    "modalUpdateScheduleBtnsDiv"
  );

  if (modalBtnId == "addScheduleBtn") {
    modalAddScheduleBtns.className = "modalBtnsDivs";
    modalShowScheduleBtnsDiv.className = "modalBtnsDivs visually-hidden";
    modalUpdateScheduleBtnsDiv.className = "modalBtnsDivs visually-hidden";
  } else if (modalBtnId == "updateSchedule") {
    modalAddScheduleBtns.className = "modalBtnsDivs visually-hidden";
    modalShowScheduleBtnsDiv.className = "modalBtnsDivs visually-hidden";
    modalUpdateScheduleBtnsDiv.className = "modalBtnsDivs";
  } else {
    modalAddScheduleBtns.className = "modalBtnsDivs visually-hidden";
    modalShowScheduleBtnsDiv.className = "modalBtnsDivs";
    modalUpdateScheduleBtnsDiv.className = "modalBtnsDivs visually-hidden";
  }
}

async function getSchedule(scheduleId) {
  const response = await $.ajax({
    url: `${API_URL}/schedule/${scheduleId}`,
    error: (error) => console.log(error),
  });
  return response;
}

async function showScheduleOnModal(scheduleId) {
  const schedule = await getSchedule(scheduleId);

  const title = document.getElementById("title");
  title.value = schedule.title;
  title.setAttribute("readonly", "readonly");

  const priority = document.getElementById("priority");
  priority.value = schedule.priority;
  priority.setAttribute("disabled", "disabled");

  const recurrenceRule = document.getElementById("recurrenceRule");
  recurrenceRule.value = schedule.recurrenceRule;
  recurrenceRule.setAttribute("disabled", "disabled");

  const startDate = document.getElementById("startDate");
  startDate.value = schedule.startDate;
  startDate.setAttribute("readonly", "readonly");

  const startTime = document.getElementById("startTime");
  startTime.value = schedule.startTime;
  startTime.setAttribute("readonly", "readonly");

  const endDate = document.getElementById("endDate");
  endDate.value = schedule.endDate;
  endDate.setAttribute("readonly", "readonly");

  const endTime = document.getElementById("endTime");
  endTime.value = schedule.endTime;
  endTime.setAttribute("readonly", "readonly");

  const description = document.getElementById("description");
  description.value = schedule.description;
  description.setAttribute("readonly", "readonly");
}

function makeScheduleEditable() {
  const title = document.getElementById("title");
  title.removeAttribute("readonly");
  const priority = document.getElementById("priority");
  priority.removeAttribute("disabled");
  const recurrenceRule = document.getElementById("recurrenceRule");
  recurrenceRule.removeAttribute("disabled");
  const startDate = document.getElementById("startDate");
  startDate.removeAttribute("readonly");
  const startTime = document.getElementById("startTime");
  startTime.removeAttribute("readonly");
  const endDate = document.getElementById("endDate");
  endDate.removeAttribute("readonly");
  const endTime = document.getElementById("endTime");
  endTime.removeAttribute("readonly");
  const description = document.getElementById("description");
  description.removeAttribute("readonly");

  modalBtnsControl("updateSchedule");
}

function readScheduleForm() {
  const title = document.getElementById("title").value;
  const priority = document.getElementById("priority").value;
  const recurrenceRule = document.getElementById("recurrenceRule").value;
  const startDate = document.getElementById("startDate").value;
  const startTime = document.getElementById("startTime").value;
  const endDate = document.getElementById("endDate").value;
  const endTime = document.getElementById("endTime").value;
  const description = document.getElementById("description").value;

  const schedule = {
    title: title,
    priority: priority,
    recurrenceRule: recurrenceRule,
    startDate: startDate,
    startTime: startTime,
    endDate: endDate,
    endTime: endTime,
    description: description,
  };

  return schedule;
}

function addSchedule() {
  const schedule = readScheduleForm();
  $.ajax({
    type: "POST",
    url: `${API_URL}/schedule`,
    data: JSON.stringify(schedule),
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    success: (response) => console.log(response.data),
    complete: () => {
      document.getElementById("scheduleModalCloseBtn").click();
      drawCalendar(new Date());
      drawSchedulesOnCalendar(new Date());
    },
    error: (error) => console.log(error),
  });
}

function updateSchedule(scheduleId) {
  const schedule = readScheduleForm();
  $.ajax({
    type: "PUT",
    url: `${API_URL}/schedule/${scheduleId}`,
    data: JSON.stringify(schedule),
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    success: (response) => console.log(response.data),
    complete: () => {
      showScheduleOnModal(scheduleId);
      modalBtnsControl(scheduleId);
      drawCalendar(new Date());
      drawSchedulesOnCalendar(new Date());
    },
    error: (error) => console.log(error),
  });
}

function deleteSchedule(scheduleId) {
  const userAnswer = confirm("Do you want to delete this schedule?");

  if (userAnswer) {
    $.ajax({
      type: "DELETE",
      url: `${API_URL}/schedule/${scheduleId}`,
      success: (response) => console.log(response.data),
      complete: () => {
        document.getElementById("scheduleModalCloseBtn").click();
        drawCalendar(new Date());
        drawSchedulesOnCalendar(new Date());
      },
      error: (error) => console.log(error),
    });
  }
}
