document.addEventListener("DOMContentLoaded", function () {
    const monthYearElement = document.getElementById("monthYear");
    const calendarTableBody = document.querySelector("#calendarTable tbody");
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const todayBtn = document.getElementById("todayBtn");
    const dateModal = document.getElementById("dateModal");
    const closeModalBtn = document.getElementById("closeDateModal");
    const modalDateElement = document.getElementById("selectedDate");
    const memoInput = document.getElementById("memoInput");
    const dietInput = document.getElementById("dietInput");
    const saveButton = document.getElementById("saveButton");

    let currentDate = new Date();
    let selectedDate = null; // 선택된 날짜
    let savedData = {}; // 날짜별 데이터를 저장

    const userEmail = localStorage.getItem("email"); // 현재 로그인한 사용자 이메일
    if (!userEmail) {
        alert("로그인이 필요합니다.");
        return;
    }

    // 초기 데이터 로드
    async function loadData() {
        try {
            const response = await fetch("http://210.117.212.105:3001/diet_calendar/get", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();
            if (data.success) {
                savedData = data.calendarEntries.reduce((acc, entry) => {
                    const { date, memo, diet } = entry;
                    acc[date] = { memo, diet };
                    return acc;
                }, {});
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("다이어트 캘린더 데이터 로드 중 오류 발생:", error);
        } finally {
            // 데이터를 로드한 후 캘린더 렌더링
            renderCalendar(currentDate);
        }
    }

    // 캘린더 렌더링 함수
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth(); // month는 0부터 시작

        // "년도-월" 표시
        monthYearElement.textContent = `${year}년 ${month + 1}월`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDateOfMonth = new Date(year, month + 1, 0); // 해당 월의 마지막 날짜
        const daysInMonth = lastDateOfMonth.getDate();
        const firstDay = firstDayOfMonth.getDay(); // 월의 시작 요일 (0: 일요일, 6: 토요일)

        // 기존 캘린더 내용 초기화
        calendarTableBody.innerHTML = "";

        let day = 1;
        for (let i = 0; i < 6; i++) { // 최대 6주
            const row = document.createElement("tr");
            for (let j = 0; j < 7; j++) { // 일~토
                const cell = document.createElement("td");

                if (i === 0 && j < firstDay) {
                    // 첫 주의 빈 칸
                    cell.classList.add("empty");
                } else if (day <= daysInMonth) {
                    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    cell.textContent = day;

                    // 오늘 강조
                    const isToday =
                        day === new Date().getDate() &&
                        month === new Date().getMonth() &&
                        year === new Date().getFullYear();
                    if (isToday) {
                        cell.classList.add("today");
                    }

                    // 선택된 날짜 강조
                    if (
                        selectedDate &&
                        selectedDate.year === year &&
                        selectedDate.month === month + 1 &&
                        selectedDate.day === day
                    ) {
                        cell.classList.add("selected");
                    }

                    // 저장된 데이터가 있으면 표시
                    if (savedData[key]) {
                        const dot = document.createElement("span");
                        dot.classList.add("dot");
                        cell.appendChild(dot);
                    }

                    // 날짜 클릭 이벤트 추가 (클로저 문제 해결)
                    ((currentDay) => {
                        cell.addEventListener("click", function () {
                            showDateModal(year, month + 1, currentDay);
                        });
                    })(day);

                    day++;
                } else {
                    // 마지막 주의 빈 칸
                    cell.classList.add("empty");
                }

                row.appendChild(cell);
            }
            calendarTableBody.appendChild(row);
            if (day > daysInMonth) break;
        }
    }

    // 날짜 클릭 시 모달 창 띄우기
    function showDateModal(year, month, day) {
        const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        selectedDate = { year, month, day };
        modalDateElement.textContent = `${year}년 ${month}월 ${day}일`;

        // 저장된 데이터 불러오기
        memoInput.value = savedData[key]?.memo || "";
        dietInput.value = savedData[key]?.diet || "";

        dateModal.style.display = "block";
    }

    // 모달 닫기
    closeModalBtn.addEventListener("click", function () {
        dateModal.style.display = "none";
    });

    // 저장 버튼 클릭 시
    saveButton.addEventListener("click", async function () {
        if (!selectedDate) return;
        const key = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;

        // 서버에 저장 요청
        try {
            const response = await fetch("http://210.117.212.105:3001/diet_calendar/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    date: key,
                    memo: memoInput.value,
                    diet: dietInput.value,
                }),
            });
            const data = await response.json();
            if (data.success) {
                alert("저장되었습니다!");
                savedData[key] = { memo: memoInput.value, diet: dietInput.value };
                dateModal.style.display = "none";
                renderCalendar(currentDate);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("저장 중 오류 발생:", error);
        }
    });

    // 이전, 다음, 오늘 버튼
    prevMonthBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    todayBtn.addEventListener("click", function () {
        currentDate = new Date();
        selectedDate = null;
        renderCalendar(currentDate);
    });

    // 초기 데이터 로드 및 렌더링
    loadData();
});
