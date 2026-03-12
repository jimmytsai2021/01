import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css';

const API_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
const PASS_THRESHOLD = Number(import.meta.env.VITE_PASS_THRESHOLD) || 3;
const QUESTION_COUNT = Number(import.meta.env.VITE_QUESTION_COUNT) || 5;

// [需求] 使用 DiceBear API 預先載入 100 張不同素材的關主圖
const PRELOADED_IMAGES = [];
for (let i = 1; i <= 100; i++) {
  const img = new Image();
  // 使用 DiceBear 像素風 URL
  img.src = `https://api.dicebear.com/9.x/pixel-art/svg?seed=GameMaster${i}`;
  PRELOADED_IMAGES.push(img.src);
}

function Home({ setPlayerId }) {
  const [id, setId] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (!id.trim()) {
      alert('請先輸入 ID 開始遊戲!');
      return;
    }
    setPlayerId(id);
    navigate('/game');
  };

  return (
    <div className="container">
      <div className="pixel-panel">
        <h1>Pixel Trivia</h1>
        <p>歡迎挑戰！請輸入 ID 以開始遊戲</p>
        <input 
          className="pixel-input" 
          value={id} 
          onChange={(e) => setId(e.target.value)} 
          placeholder="ENTER YOUR ID..." 
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        />
        <br />
        <button className="pixel-btn" onClick={handleStart}>START GAME</button>
      </div>
    </div>
  );
}

function Game({ playerId, setGameResult }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!playerId) {
      navigate('/');
      return;
    }
    
    // [需求] 透過 GAS API 隨機撈取題目
    fetch(`${API_URL}?action=getQuestions&limit=${QUESTION_COUNT}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions);
        } else {
          alert(`載入題目失敗: ${data.error}`);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert('網路連線錯誤，請確認 GAS API URL 設置正確。');
        setLoading(false);
      });
  }, [playerId, navigate]);

  const handleAnswer = (option) => {
    const newAnswers = [...answers, { id: questions[currentIdx].id, selected: option }];
    setAnswers(newAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // 送出所有的答案
      setLoading(true);
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'submitScore',
          id: playerId,
          answers: newAnswers,
          passThreshold: PASS_THRESHOLD
        })
      })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setGameResult({ score: data.score, passed: data.passed });
          navigate('/result');
        } else {
          alert('成績上傳失敗: ' + data.error);
        }
      })
      .catch(err => {
        console.error(err);
        alert('網路錯誤，無法提交成績。');
        setLoading(false);
      });
    }
  };

  if (loading) return <div className="container"><h2>LOADING...</h2></div>;
  if (!questions.length) return <div className="container"><button className="pixel-btn" onClick={() => navigate('/')}>BACK</button></div>;

  const currentQ = questions[currentIdx];
  // 隨機拿一個關主的圖片
  const gmImage = PRELOADED_IMAGES[(currentIdx + Date.now()) % PRELOADED_IMAGES.length];

  return (
    <div className="container">
      <div className="pixel-panel">
        <div className="game-master" style={{ backgroundImage: `url(${gmImage})` }}></div>
        <h2>Question {currentIdx + 1}/{questions.length}</h2>
        <p style={{ margin: '2rem 0', fontSize: '1.2rem', lineHeight: '1.8' }}>
          {currentQ.text}
        </p>
        <div className="options-grid">
          {Object.entries(currentQ.options).map(([key, value]) => (
            value && (
              <button key={key} className="option-btn" onClick={() => handleAnswer(key)}>
                {key}. {value}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function Result({ gameResult, setPlayerId }) {
  const navigate = useNavigate();
  if (!gameResult) {
    navigate('/');
    return null;
  }

  const handleRestart = () => {
    setPlayerId('');
    navigate('/');
  };

  return (
    <div className="container">
      <div className="pixel-panel">
        <h1>{gameResult.passed ? 'MISSION CLEARED!' : 'GAME OVER...'}</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          YOUR SCORE: {gameResult.score} / {QUESTION_COUNT}
        </p>
        <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '2rem' }}>
          PASS THRESHOLD: {PASS_THRESHOLD}
        </p>
        <button className="pixel-btn" onClick={handleRestart}>PLAY AGAIN</button>
      </div>
    </div>
  );
}

export default function App() {
  const [playerId, setPlayerId] = useState('');
  const [gameResult, setGameResult] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home setPlayerId={setPlayerId} />} />
        <Route path="/game" element={<Game playerId={playerId} setGameResult={setGameResult} />} />
        <Route path="/result" element={<Result gameResult={gameResult} setPlayerId={setPlayerId} />} />
      </Routes>
    </Router>
  );
}
