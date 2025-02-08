import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({path: "../.env"});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Google Generative AI 클라이언트 설정
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini 모델 초기화
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

let chatSession; // 대화 세션 전역 변수

// 사용자 정보를 받는 라우트 (info)
app.post("/info", (req, res) => {
    const { age, weight, height, activityLevel, bmi, bmr, dailyCalories } = req.body;

    try {
        // 필수 정보 확인
        if (!age || !weight || !height || !activityLevel || !bmi || !bmr || !dailyCalories) {
            return res.status(400).json({ error: "모든 사용자 정보를 입력해주세요." });
        }

        // 새로운 대화 세션 초기화
        chatSession = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `
                            당신은 한국어에 능숙한 다이어트 및 피트니스 전문 코치입니다.
                          아래는 사용자의 기본 정보입니다:
                          - 나이: ${age}세
                          - 몸무게: ${weight}kg
                          - 키: ${height}m
                          - 활동 수준: ${activityLevel}
                          - BMI: ${bmi}
                          - BMR: ${bmr}
                          - 일일 칼로리 요구량: ${dailyCalories} kcal.
      
                          앞으로 모든 질문에 대해 다음 규칙에 따라 답변하세요:
                          1. 응답은 일반인이 이해하기 쉬운 언어로 작성하세요.
                          2. 답변은 최대 5문장으로 간결하게 작성하세요.
                          3. 핵심 정보와 실질적인 팁을 제공하세요.
                          4. 질문에 대한 명확한 결론과 유용한 정보를 포함하세요.
      
                          사용자가 다음과 같은 질문을 할 수 있습니다:
                          - 자신에게 적합한 운동 추천
                          - 다이어트를 위한 식단 구성
                          - 특정 질병에 대한 운동/음식 추천 및 습관 조언
      
                          이러한 질문에 대해 위 규칙에 따라 답변해주세요.
                            `,
                        },
                    ],
                },
            ],
            generationConfig: {
                maxOutputTokens: 256,
            },
        });

        res.json({ message: "사용자 정보가 성공적으로 저장되었습니다." });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// 사용자 메시지를 처리하는 라우트 (chat)
app.post("/chat", async (req, res) => {
    const { message } = req.body;

    try {
        // 대화 세션이 초기화되지 않은 경우
        if (!chatSession) {
            return res.status(400).json({ error: "사용자 정보를 먼저 입력해주세요." });
        }

        // message 값 유효성 검사
        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "유효한 메시지를 입력해주세요." });
        }

        // 사용자 메시지를 대화 세션에 추가하고 응답 생성
        const result = await chatSession.sendMessage([
            {
                text: message,
            },
        ]);
        const response = await result.response;
        const aiResponse = response.text();

        // 응답 반환
        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
