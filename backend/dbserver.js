import express from 'express';
import { createConnection } from 'mysql';
import bcrypt from 'bcryptjs';
const { hashSync, compareSync } = bcrypt; 
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config({path: "../.env"});

const app = express();
app.use(express.json());
app.use(cors());

// MySQL 연결 설정
const db = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) throw err;
    console.log("MariaDB 연결 성공!");
});

// 회원가입
app.post('/signup', async (req, res) => {
    const { email, password, birthdate, gender } = req.body;

    if (!email || !password || !birthdate || !gender) {
        return res.json({ success: false, message: "모든 필드를 입력해주세요." });
    }

    // 비밀번호 해싱
    const hashedPassword = hashSync(password, 10); // hashSync 사용

    const sql = "INSERT INTO users (email, password, birthdate, gender) VALUES (?, ?, ?, ?)";
    db.query(sql, [email, hashedPassword, birthdate, gender], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.json({ success: false, message: "이미 존재하는 이메일입니다." });
            }
            return res.json({ success: false, message: "회원가입 중 오류 발생." });
        }
        res.json({ success: true, message: "회원가입 성공!" });
    });
});

// 로그인
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.json({ success: false, message: "로그인 중 오류 발생." });

        if (results.length === 0) {
            return res.json({ success: false, message: "존재하지 않는 사용자입니다." });
        }

        const user = results[0];
        const isMatch = compareSync(password, user.password); // compareSync 사용

        if (!isMatch) {
            return res.json({ success: false, message: "비밀번호가 틀렸습니다." });
        }

        res.json({ success: true, username: email.split('@')[0] });
    });
});

// 회원탈퇴
app.post('/delete-account', (req, res) => {
    const { email } = req.body;

    const sql = "DELETE FROM users WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) return res.json({ success: false, message: "회원탈퇴 중 오류 발생." });

        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "존재하지 않는 사용자입니다." });
        }

        res.json({ success: true, message: "회원탈퇴 성공!" });
    });
});

// 로그인한 사용자 정보 가져오기
app.post('/user', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "이메일이 필요합니다." });
    }

    const sql = "SELECT gender, birthdate FROM users WHERE email = ?";
    db.query(sql, [email], (err, rows) => {
        if (err) {
            console.error("DB 오류:", err);
            return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
        }

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }

        res.json({ success: true, user: rows[0] });
    });
});


// 사용자 프로필 저장
app.post('/profile', (req, res) => {
    const { email, weight, height, activityLevel } = req.body;

    // 입력값 검증
    if (!email || !weight || !height || !activityLevel) {
        return res.status(400).json({ success: false, message: "모든 필드를 입력해주세요." });
    }

    // 사용자 ID 조회
    const getUserIdQuery = "SELECT user_id FROM users WHERE email = ?";
    db.query(getUserIdQuery, [email], (err, results) => {
        if (err) {
            console.error("사용자 ID 조회 중 오류:", err);
            return res.status(500).json({ success: false, message: "사용자 ID 조회 중 오류 발생." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "존재하지 않는 사용자입니다." });
        }

        const userId = results[0].user_id;

        // 프로필 데이터 저장
        const insertProfileQuery = `
            INSERT INTO profiles (user_id, weight, height, activity_level)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE weight = VALUES(weight), height = VALUES(height), activity_level = VALUES(activity_level)
        `;
        db.query(
            insertProfileQuery,
            [userId, weight, height, activityLevel],
            (insertErr, insertResult) => {
                if (insertErr) {
                    console.error("프로필 저장 중 오류:", insertErr);
                    return res.status(500).json({ success: false, message: "프로필 저장 중 오류 발생." });
                }

                res.json({ success: true, message: "프로필이 성공적으로 저장되었습니다." });
            }
        );
    });
});


// 다이어트 캘린더 데이터 가져오기
app.post('/diet_calendar/get', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "이메일이 필요합니다." });
    }

    const getUserIdQuery = "SELECT user_id FROM users WHERE email = ?";
    db.query(getUserIdQuery, [email], (err, results) => {
        if (err) {
            console.error("사용자 ID 조회 중 오류:", err);
            return res.status(500).json({ success: false, message: "사용자 ID 조회 중 오류 발생." });
        }

        if (results.length === 0) {
            console.log("저장 데이터가 존재하지 않습니다.");
            return res.json({ success: true, calendarEntries: [] });
        }

        const userId = results[0].user_id;

        const sql = `
            SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, memo, diet
            FROM diet_calendar WHERE user_id = ?
        `;
        db.query(sql, [userId], (fetchErr, results) => {
            if (fetchErr) {
                console.error("다이어트 캘린더 데이터 조회 중 오류:", fetchErr);
                return res.status(500).json({ success: false, message: "데이터 조회 중 오류 발생." });
            }

            res.json({ success: true, calendarEntries: results });
        });
    });
});


// 다이어트 캘린더 데이터 저장
app.post('/diet_calendar/save', (req, res) => {
    const { email, date, memo, diet } = req.body;

    if (!email || !date) {
        return res.status(400).json({ success: false, message: "이메일과 날짜가 필요합니다." });
    }

    // 사용자 ID 조회
    const getUserIdQuery = "SELECT user_id FROM users WHERE email = ?";
    db.query(getUserIdQuery, [email], (err, results) => {
        if (err) {
            console.error("사용자 ID 조회 중 오류:", err);
            return res.status(500).json({ success: false, message: "사용자 ID 조회 중 오류 발생." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "존재하지 않는 사용자입니다." });
        }

        const userId = results[0].user_id;

        // 다이어트 캘린더 데이터 저장
        const sql = `
            INSERT INTO diet_calendar (user_id, date, memo, diet)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE memo = VALUES(memo), diet = VALUES(diet)
        `;
        db.query(sql, [userId, date, memo, diet], (insertErr) => {
            if (insertErr) {
                console.error("다이어트 캘린더 데이터 저장 중 오류:", insertErr);
                return res.status(500).json({ success: false, message: "저장 중 오류 발생." });
            }
            res.json({ success: true, message: "저장 성공!" });
        });
    });
});

// 채팅 기록 저장 라우터
app.post("/chat_history", (req, res) => {
    const { email, userMessage, assistantMessage } = req.body;

    // 필수 필드 검증
    if (!email || !userMessage) {
        return res.status(400).json({ success: false, message: "이메일과 메시지는 필수입니다." });
    }

    // 사용자 ID 조회
    const getUserIdQuery = "SELECT user_id FROM users WHERE email = ?";
    db.query(getUserIdQuery, [email], (err, results) => {
        if (err) {
            console.error("사용자 ID 조회 실패:", err);
            return res.status(500).json({ success: false, message: "사용자 ID 조회 중 오류 발생." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }

        const userId = results[0].user_id;

        // 채팅 기록 저장
        const saveChatQuery = `
            INSERT INTO chat_history (user_id, message, response, created_at)
            VALUES (?, ?, ?, NOW())
        `;
        db.query(saveChatQuery, [userId, userMessage, assistantMessage || null], (insertErr) => {
            if (insertErr) {
                console.error("채팅 기록 저장 실패:", insertErr);
                return res.status(500).json({ success: false, message: "채팅 기록 저장 중 오류 발생." });
            }

            res.json({ success: true, message: "채팅 기록이 성공적으로 저장되었습니다." });
        });
    });
});



// 서버 실행
app.listen(3001, () => {
    console.log("서버가 3001번 포트에서 실행 중입니다.");
});


