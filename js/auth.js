document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('authModal');
    const loginLink = document.querySelector('a[href="#login"]'); // 로그인 링크
    const signupLink = document.querySelector('a[href="#signup"]'); // 회원가입 링크
    const closeButton = document.getElementById('closeModal');
    const authSection = document.querySelector('.auth'); // 로그인/회원가입 섹션

    // 새로고침 또는 브라우저 종료 시 로그아웃
    window.addEventListener('beforeunload', function () {
        sessionStorage.removeItem('email'); // 세션 스토리지에서 이메일 삭제
    });

    // 로그인 링크 클릭
    loginLink.addEventListener('click', function (e) {
        e.preventDefault();
        openModal('login');
    });

    // 회원가입 링크 클릭
    signupLink.addEventListener('click', function (e) {
        e.preventDefault();
        openModal('signup');
    });

    // 모달 닫기 버튼 클릭
    closeButton.addEventListener('click', function (e) {
        e.preventDefault();
        closeModal();
    });

    // 배경 클릭 시 모달 닫기
    document.querySelector('.authModal-bg').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // 모달 열기 함수
    function openModal(type) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // 페이지 스크롤 방지

        // 탭 전환
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const loginForm = document.querySelector('.authModal-body#login-form');
        const signupForm = document.querySelector('.authModal-body#signup-form');

        if (type === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    }

    // 모달 닫기 함수
    function closeModal() {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 페이지 스크롤 복원
    }

    // 로그인 탭 클릭 시
    document.getElementById('login-tab').addEventListener('click', () => switchTab('login'));

    // 회원가입 탭 클릭 시
    document.getElementById('signup-tab').addEventListener('click', () => switchTab('signup'));

    // 탭 전환 함수
    function switchTab(type) {
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const loginForm = document.querySelector('.authModal-body#login-form');
        const signupForm = document.querySelector('.authModal-body#signup-form');

        if (type === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    }

    document.querySelectorAll('.gender-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.gender-btn').forEach(btn => btn.classList.remove('selected')); // 기존 선택 해제
            this.classList.add('selected'); // 선택된 버튼 스타일 추가
            document.getElementById('signup-gender').value = this.dataset.gender; // 숨겨진 필드에 값 설정
        });
    });
    

    // 회원가입 폼 제출 이벤트
    const signupForm = document.querySelector('#signup-form form');
    signupForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-pwd').value;
    const confirmPwd = document.getElementById('confirm-pwd').value;
    const birthdate = document.getElementById('signup-birthdate').value;
    const gender = document.getElementById('signup-gender').value;

    if (password !== confirmPwd) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    // 서버로 회원가입 요청 보내기
    fetch('http://210.117.212.105:3001/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, birthdate, gender })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("회원가입이 완료되었습니다!");
                switchTab('login'); // 회원가입 완료 후 로그인 탭으로 이동
            } else {
                alert(`회원가입 실패: ${data.message}`);
            }
        })
        .catch(error => console.error('회원가입 중 오류 발생:', error));
    });


    // 로그인 폼 제출 이벤트
    const loginForm = document.querySelector('#login-form form');
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-pwd').value;

        fetch('http://210.117.212.105:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("로그인 성공!");
                    closeModal();
                    showWelcomeMessage(data.username); // 사용자 이름 표시

                    // sessionStorage에 이메일 저장
                    sessionStorage.setItem('email', email);
                } else {
                    alert("로그인 실패: 이메일 또는 비밀번호를 확인해주세요.");
                }
            })
            .catch(error => console.error('로그인 중 오류 발생:', error));
    });

    // 로그인 성공 후 환영 메시지 표시
    function showWelcomeMessage(username) {
        authSection.innerHTML = `
            <ul>
                <li>환영합니다, ${username}님!</li>
                <li><a href="#" id="logoutLink">로그아웃</a></li>
                <li><a href="#" id="deleteAccountLink">회원탈퇴</a></li>
            </ul>
        `;

        document.getElementById('logoutLink').addEventListener('click', function (e) {
            e.preventDefault();
            logoutUser();
        });

        document.getElementById('deleteAccountLink').addEventListener('click', function (e) {
            e.preventDefault();
            deleteUser();
        });
    }

    // 로그아웃 함수
    function logoutUser() {
        alert("로그아웃 되었습니다.");
        sessionStorage.removeItem('email');
        location.reload();
    }

    // 회원탈퇴 함수
    function deleteUser() {
        const confirmation = confirm("정말로 회원탈퇴를 하시겠습니까?");
        if (confirmation) {
            const email = sessionStorage.getItem('email');

            fetch('http://210.117.212.105:3001/delete-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("회원탈퇴가 완료되었습니다.");
                        sessionStorage.removeItem('email');
                        location.reload();
                    } else {
                        alert(`회원탈퇴 실패: ${data.message}`);
                    }
                })
                .catch(error => console.error('회원탈퇴 중 오류 발생:', error));
        }
    }
});
