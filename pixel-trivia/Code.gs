function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getQuestions') {
    const limit = parseInt(e.parameter.limit) || 10;
    return createJsonResponse(getQuestions(limit));
  }
  return createJsonResponse({ error: 'Invalid action' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'submitScore') {
      return createJsonResponse(submitScore(data.id, data.answers, data.passThreshold));
    }
  } catch(err) {
    return createJsonResponse({ error: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getQuestions(limit) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('題目');
  if (!sheet) return { success: false, error: '找不到「題目」工作表' };
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  const shuffled = rows.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, limit);
  
  const questions = selected.map(row => ({
    id: row[0],
    text: row[1],
    options: { A: row[2], B: row[3], C: row[4], D: row[5] }
  }));
  
  return { success: true, questions: questions };
}

function submitScore(id, answers, passThreshold) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const qSheet = ss.getSheetByName('題目');
  const aSheet = ss.getSheetByName('回答');
  
  if (!qSheet || !aSheet) return { success: false, error: '工作表不存在' };
  
  const qData = qSheet.getDataRange().getValues();
  const qMap = {};
  for (let i = 1; i < qData.length; i++) {
    qMap[qData[i][0]] = qData[i][6]; // 解答欄位 (索引 6)
  }
  
  let correctCount = 0;
  answers.forEach(ans => {
    if (qMap[ans.id] === ans.selected) correctCount++;
  });
  
  const passed = correctCount >= passThreshold;
  const aData = aSheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < aData.length; i++) {
    if (aData[i][0] == id) {
      rowIndex = i + 1; // GAS row index (1-based)
      break;
    }
  }
  
  const now = new Date();
  
  if (rowIndex !== -1) {
    // 既有玩家
    const playCount = parseInt(aSheet.getRange(rowIndex, 2).getValue() || 0) + 1;
    const totalScore = parseInt(aSheet.getRange(rowIndex, 3).getValue() || 0) + correctCount;
    const highestScore = Math.max(parseInt(aSheet.getRange(rowIndex, 4).getValue() || 0), correctCount);
    let firstPassScore = aSheet.getRange(rowIndex, 5).getValue();
    let attemptsToPass = aSheet.getRange(rowIndex, 6).getValue();
    
    // 若本次通過且之前未通過
    if (passed && !firstPassScore) {
      firstPassScore = correctCount;
      attemptsToPass = playCount;
    }
    
    aSheet.getRange(rowIndex, 2).setValue(playCount);
    aSheet.getRange(rowIndex, 3).setValue(totalScore);
    aSheet.getRange(rowIndex, 4).setValue(highestScore);
    if (firstPassScore) aSheet.getRange(rowIndex, 5).setValue(firstPassScore);
    if (attemptsToPass) aSheet.getRange(rowIndex, 6).setValue(attemptsToPass);
    aSheet.getRange(rowIndex, 7).setValue(now);
  } else {
    // 新玩家
    const attemptsToPass = passed ? 1 : '';
    const firstPassScore = passed ? correctCount : '';
    aSheet.appendRow([id, 1, correctCount, correctCount, firstPassScore, attemptsToPass, now]);
  }
  
  return { success: true, score: correctCount, passed: passed };
}
