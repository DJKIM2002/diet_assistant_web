// jQuery를 활용한 폼 확대 효과
function expandForm(formClass) {
    // 로그인이 되어 있는지 확인
    const isLoggedIn = sessionStorage.getItem("email") !== null; // email이 로컬스토리지에 있으면 로그인 상태

    if (!isLoggedIn) {
        alert("로그인을 하고 진행해주세요.");
        return;
    }

    $('.grid-item').not(formClass).fadeOut(300); // 다른 폼은 페이드 아웃
    $(formClass).find('.placeholder-image').fadeOut(300); // 프로필 이미지 페이드 아웃
    
    $(formClass).css({ position: 'fixed', zIndex: 1000 }).animate({
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh'
    }, 500, function() {
        $('.back-button').fadeIn(300); // 이전 버튼 표시
        $(this).addClass('expanded');
        $('.expanded .form-content').fadeIn(300); // 프로필 입력 섹션 표시
    });
}

// 폼 축소 및 원래 레이아웃 복구
function collapseForm() {
    $('.back-button').fadeOut(300); // 이전 버튼 숨기기
    $('.grid-item').animate({
        top: '',
        left: '',
        width: '',
        height: ''
    }, 500, function() {
        $(this).css({ position: '', zIndex: '' }).removeAttr('style');
        $('.grid-item').fadeIn(300); // 모든 폼을 원래 상태로 페이드 인
        $('.grid-item.expanded .placeholder-image').show(); // 프로필 이미지 표시
        $('.grid-item.expanded .form-content').hide(); // 프로필 입력 섹션 숨기기
        $('.grid-item.expanded').removeClass('expanded'); // 확대 상태 해제
    });
}

// 랜덤 건강 팁 표시
$(document).ready(function() {
    const healthTips = [
        "매일 충분한 물을 섭취하세요.",
        "규칙적으로 운동하는 습관을 가져보세요.",
        "정신 건강을 위해 휴식을 취하세요.",
        "밝은 색의 채소를 자주 섭취하세요.",
        "스트레칭으로 유연성을 기르세요.",
        "잠은 하루 7-8시간을 권장합니다."
    ];
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    $('#healthTip').text(randomTip);
});


// BMI 및 칼로리 계산 함수
function calculateBMIAndCalories() {
    const weight = parseFloat($("#weight").val());
    const height = parseFloat($("#height").val()) / 100; // cm를 m로 변환
    const activityLevel = parseInt($("#activityLevel").val());
    const email = sessionStorage.getItem("email");

    // 입력값 검증
    if (isNaN(weight) || weight < 10.0 || weight > 300.0) {
        alert("체중은 10.0kg부터 300.0kg까지만 입력 가능합니다.");
        return;
    }

    if (isNaN(height) || height < 0.45 || height > 2.5) {
        alert("키는 45.0cm부터 250.0cm까지만 입력 가능합니다.");
        return;
    }

    if (!activityLevel || activityLevel < 1 || activityLevel > 5) {
        alert("운동 수준을 선택해주세요.");
        return;
    }

    if (!email) {
        alert("로그인이 필요합니다.");
        return;
    }

    // 사용자 정보를 가져오기 위해 POST 요청
    fetch('http://210.117.212.105:3001/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }) // 요청 본문에 이메일 전달
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 에러 상태: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const { gender, birthdate } = data.user;

                // 생년월일로 나이 계산
                const currentYear = new Date().getFullYear();
                const birthYear = new Date(birthdate).getFullYear();
                const age = currentYear - birthYear;

                if (isNaN(age) || age < 5 || age > 150) {
                    alert("생년월일이 올바르지 않습니다.");
                    return;
                }

                // BMI 계산
                const bmi = (weight / (height * height)).toFixed(1);
                $("#bmiResult").text(bmi);

                // 비만 정도 평가
                const bmiCategory = getBMICategory(bmi);
                $("#bmiCategory").text(bmiCategory);

                // BMR 및 칼로리 계산
                let bmr;
                if (gender === "남") {
                    bmr = (88.36 + (13.4 * weight) + (4.8 * (height * 100)) - (5.7 * age)).toFixed(0);
                } else if (gender === "여") {
                    bmr = (447.6 + (9.2 * weight) + (3.1 * (height * 100)) - (4.3 * age)).toFixed(0);
                }
                $("#bmrResult").text(bmr);

                const dailyCalories = (bmr * activityLevel).toFixed(0);
                $("#calorieResult").text(dailyCalories);

                 // 서버로 프로필 데이터 전송
                fetch('http://210.117.212.105:3001/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, weight, height, activityLevel }) // 요청 본문에 데이터 전달
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP 에러 상태: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            alert("프로필이 성공적으로 저장되었습니다.");
                        } else {
                            alert(`프로필 저장 실패: ${data.message}`);
                        }
                    })
                    .catch(error => {
                        console.error("프로필 저장 중 오류 발생:", error.message);
                        alert("프로필 저장 중 오류가 발생했습니다.");
                    });

                const userData = {
                    age,
                    gender,
                    weight,
                    height,
                    activityLevel,
                    bmi,
                    bmr,
                    dailyCalories
                };

                // 데이터 전송
                return fetch('http://210.117.212.105:3000/info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
            } else {
                throw new Error(data.message || "사용자 정보를 가져오지 못했습니다.");
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("사용자 정보가 성공적으로 저장되었습니다.");
            } else {
                console.error("정보 저장 실패:", data.message);
            }
        })
        .catch(error => {
            console.error("에러:", error);
            alert("BMI 및 칼로리 계산 중 오류가 발생했습니다.");
        });
}

// BMI에 따른 비만 정도를 평가하는 함수
function getBMICategory(bmi) {
    if (isNaN(bmi)) return "오류";  // bmi가 숫자가 아닌 경우 오류 반환
    if (bmi < 18.5) return "저체중";
    else if (bmi < 23) return "정상 체중";
    else if (bmi < 25) return "과체중";
    else if (bmi < 30) return "비만";
    else return "고도 비만";
}

function toggleBMIScale() {
    const bmiScale = document.querySelector('.bmi-scale');
    if (bmiScale.classList.contains('hidden')) {
        bmiScale.classList.remove('hidden'); // 비만 척도 표 표시
    } else {
        bmiScale.classList.add('hidden'); // 비만 척도 표 숨기기
    }
}
