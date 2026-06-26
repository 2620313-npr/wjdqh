// 첫 로딩 시 암호풀기 화면은 가려두기
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('decode-tab').style.display = 'none';
});

// 탭 화면 전환 기능
function switchTab(tabName) {
  const encodeBtn = document.getElementById('btn-encode');
  const decodeBtn = document.getElementById('btn-decode');
  const encodeTab = document.getElementById('encode-tab');
  const decodeTab = document.getElementById('decode-tab');
  
  if (tabName === 'encode') {
    encodeBtn.classList.add('active');
    decodeBtn.classList.remove('active');
    encodeTab.style.display = 'block';
    decodeTab.style.display = 'none';
  } else {
    encodeBtn.classList.remove('active');
    decodeBtn.classList.add('active');
    encodeTab.style.display = 'none';
    decodeTab.style.display = 'block';
  }
}

// 1. 암호 만들기 핵심 로직
function hideText(publicText, secretText) {
  let hiddenUnicode = "";
  
  const encoder = new TextEncoder();
  const bytes = encoder.encode(secretText);

  for (let i = 0; i < bytes.length; i++) {
    let binary = bytes[i].toString(2).padStart(8, '0');
    
    for (let bit of binary) {
      if (bit === '0') hiddenUnicode += '\u200B';
      else if (bit === '1') hiddenUnicode += '\u200C';
    }
  }
  return publicText + hiddenUnicode;
}

// 2. 암호 풀기 핵심 로직
function revealText(encryptedText) {
  let binaryString = "";
  let bytes = [];

  for (let i = 0; i < encryptedText.length; i++) {
    let char = encryptedText[i];
    if (char === '\u200B') binaryString += '0';
    else if (char === '\u200C') binaryString += '1';
  }

  if (binaryString.length === 0) return "";

  for (let i = 0; i < binaryString.length; i += 8) {
    let byte = binaryString.substr(i, 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }

  try {
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  } catch (e) {
    return "";
  }
}

// 버튼 클릭 연동 - 암호 생성
function processEncode() {
  const publicText = document.getElementById('public-input').value;
  const secretText = document.getElementById('secret-input').value;
  
  if(!publicText || !secretText) {
    alert("두 입력창을 모두 채워주세요!");
    return;
  }
  
  const result = hideText(publicText, secretText);
  document.getElementById('encode-result').innerText = result;
  
  const resContainer = document.getElementById('encode-result-container');
  resContainer.style.display = 'block';
}

// 버튼 클릭 연동 - 암호 해독
function processDecode() {
  const cipherText = document.getElementById('cipher-input').value;
  const resultElement = document.getElementById('decode-result');
  
  if(!cipherText) {
    alert("암호글을 입력해주세요!");
    return;
  }
  
  const result = revealText(cipherText);
  
  if(result === "") {
    resultElement.innerText = "🕵️‍♂️ 데이터가 감지되지 않았습니다. (숨겨진 암호 없음)";
    resultElement.style.color = "#ef4444";
    resultElement.style.borderColor = "#ef4444";
  } else {
    resultElement.innerText = result;
    resultElement.style.color = "#10b981";
    resultElement.style.borderColor = "#10b981";
  }
  
  document.getElementById('decode-result-container').style.display = 'block';
}

// 모바일 및 모든 브라우저 호환 자동 복사 함수
function copyResult() {
  const resultText = document.getElementById('encode-result').innerText;
  if(!resultText) return;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(resultText).then(() => {
      alert("📋 암호글이 안전하게 복사되었습니다! 암호 풀기 탭에 붙여넣어 보세요.");
    }).catch(() => {
      fallbackCopy(resultText); 
    });
  } else {
    fallbackCopy(resultText); 
  }
}

// 구형 브라우저 및 인앱 브라우저용 백업 복사 로직
function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    alert("📋 암호글이 안전하게 복사되었습니다! 암호 풀기 탭에 붙여넣어 보세요.");
  } catch (err) {
    alert("복사에 실패했습니다. 결과를 직접 드래그해서 복사해주세요.");
  }
  document.body.removeChild(textArea);
}
