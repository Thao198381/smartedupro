import React, { useState, useEffect } from 'react';
import { KETQUA_URL } from '../config';

const TeacherWordTask = ({ onBack }) => {
  // Thêm vào cùng các state khác
  const [searchId, setSearchId] = useState(''); // Lưu ID câu hỏi cần sửa lẻ
const [previewData, setPreviewData] = useState([]);
const [isReviewing, setIsReviewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idgv, setIdgv] = useState('');
  const [customLink, setCustomLink] = useState(''); // Để dự phòng nếu cần dán trực tiếp link
  const [examCode, setExamCode] = useState('');
  const [rawLGText, setRawLGText] = useState('');

  const [config, setConfig] = useState({
    numMCQ: 12, scoreMCQ: 0.25,
    numTF: 4, scoreTF: 1.0,
    numSA: 6, scoreSA: 0.5,
    duration: 90,
    mintime: 60,
    tab: 2,
    open: new Date().toISOString().slice(0,16),  // thời gian mở
    close: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0,16), // thời gian đóng
    maxthi: 1
  });

  const [jsonInputWord, setJsonInputWord] = useState('');
  const [jsonInputLG, setJsonInputLG] = useState('');
  // Hàm ép MathJax render lại sau khi dữ liệu thay đổi
  useEffect(() => {
    if (isReviewing && window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, [isReviewing, previewData]);
 // ==================== HÀM SỬA CÂU LẺ (REACT) ====================
  const handleEditSingleQuestion = async () => {

  if (!idgv || !examCode || !searchId) {
    alert("Thầy cần nhập đủ: IDGV, Mã đề và ID câu hỏi muốn sửa!");
    return;
  }

  const targetUrl = KETQUA_URL;

  if (!targetUrl) {
    alert("❌ Không tìm thấy API của giáo viên này!");
    return;
  }

  setLoading(true);

  try {

    const url =
      `${targetUrl}?action=getSingleQuestion`
      + `&examCode=${encodeURIComponent(examCode)}`
      + `&questionId=${encodeURIComponent(searchId)}`;

    const resp = await fetch(url, { method: "GET" });

    const text = await resp.text();

    let res;

    try {
      res = JSON.parse(text);
    } catch {
      throw new Error("API không trả JSON: " + text.substring(0,100));
    }

    if (res.status === "success" && res.data) {

      let questionString = "";

      if (typeof res.data.question === "object") {
        questionString = JSON.stringify(res.data.question, null, 2);
      } else {

        try {
          const parsed = JSON.parse(res.data.question);
          questionString = JSON.stringify(parsed, null, 2);
        } catch {
          questionString = res.data.question;
        }

      }

      const singleData = [{
        id: res.data.id,
        classTag: res.data.classTag,
        type: res.data.type,
        question: questionString
      }];

      setPreviewData(singleData);
      setIsReviewing(true);

    } else {

      alert(res.message || "Không tìm thấy câu hỏi này!");

    }

  } catch (e) {

    console.error(e);
    alert("❌ Lỗi kết nối API: " + e.message);

  } finally {

    setLoading(false);

  }
};
 
  // Tái sử dụng hàm bóc tách của thầy
  // =========================================================================================================================================
  const handleWordParser = (text) => {
  if (!text.trim()) {
    alert("Dán dữ liệu vào đã thầy ơi!");
    return;
  }

  // 1️⃣ Tách câu theo }#
  const rawBlocks = text
    .split('}#')
    .map(b => b.trim())
    .filter(b => b.startsWith('{'))
    .map(b => b.endsWith('}') ? b : b + '}');

  if (rawBlocks.length === 0) {
    alert("Không tìm thấy câu hỏi hợp lệ!");
    return;
  }

  // 2️⃣ Parse từng block
  const results = rawBlocks.map((block, index) => {
    try {
      const obj = new Function(`return (${block})`)();

      return {
        id: obj.id || Date.now() + index,
        classTag: (obj.classTag || "1001.a").trim(),
        type: obj.type || "short-answer",
        question: JSON.stringify(obj, null, 2) // 🔥 LƯU NGUYÊN JSON
      };
    } catch (e) {
      console.error("❌ Lỗi parse câu:", block);
      return null;
    }
  }).filter(Boolean);

  if (!results.length) {
    alert("Parse xong nhưng không có câu nào hợp lệ!");
    return;
  }

  // 3️⃣ Gửi thẳng sang GAS
  setPreviewData(results);
  setIsReviewing(true);
};


  // ==============================================================================================================================================
   
const handleSaveQuestions = async (dataArray) => {

  if (!dataArray || (Array.isArray(dataArray) && dataArray.length === 0)) {
    alert("Chưa có dữ liệu để nạp!");
    return;
  }

  setLoading(true);

  try {

    const targetUrl = KETQUA_URL;

    // ⭐ Convert question thành JSON string
    const formattedData = dataArray.map(q => ({
      ...q,
      question: typeof q.question === "object"
        ? JSON.stringify(q.question)
        : q.question
    }));

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "saveOnlyQuestions",
        examCode: examCode,
        idgv: idgv,
        questions: formattedData
      }),
    });

    const result = await response.json();

    if (result.status === "success") {
      alert("✅ Ngon lành: " + result.message);
       setPreviewData([]);
       setIsReviewing(false);
      window.location.replace("https://vietnamexam.vercel.app/");
    } else {
      alert("❌ Lỗi Script: " + result.message);
    }

  } catch (error) {

    console.error("Lỗi fetch:", error);
    alert("Không kết nối được với Script!");

  } finally {

    setLoading(false);

  }
};
  // 1.  =====================================================================================================
  const handleSaveConfig = async (force = false) => {
  if (!idgv) return alert("❌ Thầy chưa nhập ID Giáo viên!");
  if (!examCode) return alert("❌ Cần nhập Mã đề!");
  
  const targetUrl = KETQUA_URL;
  if (!targetUrl) return alert("❌ Không tìm thấy Link Script cho ID này!");

  setLoading(true);
  try {
    // Bỏ &force=${force} ở URL cho sạch, đưa hẳn vào body
    const resp = await fetch(`${targetUrl}?action=saveExamConfig`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ 
        idgv, 
        examCode, 
        config, 
        force }) // Thêm force vào đây
    });
    const res = await resp.json();

    if (res.status === 'exists') {
      if (window.confirm("⚠️ Mã đề này đã có cấu hình. Thầy có muốn GHI ĐÈ không?")) {
        handleSaveConfig(true); // Gọi lại với force = true
      }
    } else {
      alert(res.message);
    }
  } catch (e) {
    alert("❌ Lỗi kết nối đến Script giáo viên!");
  } finally {
    setLoading(false);
  }
};

// =================================================bóc lời giải ============================================================================================
 const handleSolutionParser = (text) => {
  if (!text || !text.trim()) {
    alert("❌ Chưa có nội dung LG");
    return;
  }

  const blocks = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '{') {
      if (depth === 0) current = '';
      depth++;
    }

    if (depth > 0) current += ch;

    if (ch === '}') {
      depth--;
      if (depth === 0) blocks.push(current.trim());
    }
  }

  if (!blocks.length) {
    alert("❌ Không bóc được block LG nào");
    return;
  }

  // 🔥 LƯU MẢNG STRING – KHÔNG PARSE
  setJsonInputLG(blocks);

  alert(`✅ Đã bóc ${blocks.length} lời giải`);
};



  // 3. LƯU LỜI GIẢI từ word ==========================================================================================================================================================
  const handleUpdateSolutions = async () => {
  if (!idgv || !examCode) {
    alert("❌ Thiếu IDGV hoặc mã đề");
    return;
  }

  if (!Array.isArray(jsonInputLG) || jsonInputLG.length === 0) {
    alert("❌ Chưa có LG để nạp");
    return;
  }

  const targetUrl = KETQUA_URL;
  setLoading(true);

  try {
    const resp = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "saveOnlySolutions",
        examCode,
        solutions: jsonInputLG   // 🔥 ĐÚNG KIỂU
      })
    });

    const res = await resp.json();
    alert(`✅ Đã  lời giải thành công rồi nhé tình yêu!`);
  } catch (e) {
    console.error(e);
    alert("❌ Không kết nối được GAS");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="p-3 md:p-6 bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl max-w-6xl mx-auto border-4 border-slate-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 md:mb-6 p-3 md:p-6 bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem]">
        
        {/* CỘT BÊN TRÁI: XÁC MINH & CẤU HÌNH */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-r border-slate-800 pr-4">
          <div className="space-y-3">
            <div className="text-[10px] text-emerald-400 font-bold uppercase ml-2">Xác thực hệ thống</div>
            <input
  type="text"
  inputMode="numeric"
  autoComplete="off"
  pattern="[0-9]*"
  className="w-full p-3 md:p-4 min-h-[44px] rounded-xl bg-slate-800 text-white font-bold border border-slate-700 shadow-inner focus:border-emerald-500 outline-none transition-all"
  placeholder="ID GIÁO VIÊN..."
  value={idgv}
  onChange={(e) => setIdgv(e.target.value.trim())}
/>
            <input 
              className="w-full p-4 rounded-xl bg-slate-500 text-white font-black text-center placeholder-slate-300 shadow-inner" 
              placeholder="MÃ ĐỀ KT (EXAMS)..." 
              value={examCode} 
              onChange={e => setExamCode(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-white bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
            <div className="col-span-2 text-emerald-400 font-bold uppercase mb-1 flex justify-between">
              <span>Cấu hình câu hỏi</span>
              <i className="fas fa-cog"></i>
            </div>
            <div>MCQ: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700" value={config.numMCQ} onChange={e => setConfig({...config, numMCQ: e.target.value})}/></div>
            <div>Điểm/câu: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700" value={config.scoreMCQ} onChange={e => setConfig({...config, scoreMCQ: e.target.value})}/></div>
            
            <div>TF: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700" value={config.numTF} onChange={e => setConfig({...config, numTF: e.target.value})}/></div>
            <div>Điểm/câu: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700" value={config.scoreTF} onChange={e => setConfig({...config, scoreTF: e.target.value})}/></div>
            
            <div>SA: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700" value={config.numSA} onChange={e => setConfig({...config, numSA: e.target.value})}/></div>
            <div>Điểm/câu: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700" value={config.scoreSA} onChange={e => setConfig({...config, scoreSA: e.target.value})}/></div>

            <div className="col-span-2 text-orange-400 font-bold uppercase mt-2 border-t border-slate-700 pt-1">Thời gian & Bảo mật</div>
            <div>Phút thi: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-orange-300" value={config.duration} onChange={e => setConfig({...config, duration: e.target.value})}/></div>
            <div>Nộp bài sau: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-orange-300" value={config.mintime} onChange={e => setConfig({...config, mintime: e.target.value})}/></div>
             <div>Ngày mở: <input type="datetime-local" className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-[9px]" value={config.open} onChange={e => setConfig({...config, open: e.target.value})}/></div>
            <div>Lỗi Tab: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-red-400" value={config.tab} onChange={e => setConfig({...config, tab: e.target.value})}/></div>         

            <div>Ngày đóng: <input type="datetime-local" className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-[9px]" value={config.close} onChange={e => setConfig({...config, close: e.target.value})}/></div>
            <div>Số lần thi: <input type="number" className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-[9px]" value={config.maxthi} onChange={e => setConfig({...config, maxthi: e.target.value})}/></div>
          </div>
        </div>

        {/* CỘT BÊN PHẢI: HÀNH ĐỘNG */}
        <div className="flex flex-col gap-2 justify-center">
          <button 
            disabled={loading}
            onClick={() => handleSaveConfig(false)} 
            className="py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all text-sm border-b-4 border-blue-800"
          >
            {loading ? "ĐANG LƯU..." : "LƯU CẤU HÌNH ĐỀ"}
          </button>
          <button 
            disabled={loading}
            onClick={() => handleWordParser(jsonInputWord)}
            className="py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg hover:bg-orange-700 active:scale-95 disabled:opacity-50 transition-all text-sm border-b-4 border-orange-800"
          >
            REVIEW VÀ LƯU CÂU HỎI
          </button>
         <div className="flex flex-col gap-2 p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
  <div className="text-[10px] text-orange-400 font-bold uppercase ml-1">Sửa nhanh câu lẻ</div>
  <div className="flex gap-2">
    <input 
      type="text"
      placeholder="ID CÂU..."
      className="flex-1 bg-slate-900 text-white p-2 rounded-lg text-xs border border-slate-700 outline-none focus:border-orange-500"
      value={searchId}
      onChange={e => setSearchId(e.target.value)}
    />
    <button 
      disabled={loading}
      onClick={handleEditSingleQuestion}
      className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-[10px] hover:bg-orange-700 active:scale-95 transition-all shadow-lg"
    >
     TÌM KIẾM
    </button>
  </div>
</div>
          <button
          disabled={loading}
          onClick={handleUpdateSolutions}
          className="py-4 bg-purple-600 text-white rounded-2xl font-black"
          >
          CẬP NHẬT LỜI GIẢI
        </button>

          <button 
            onClick={onBack} 
            className="w-full py-2 mt-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all"
          >
            QUAY VỀ TRANG CHỦ
          </button>
        </div>
      </div>

      {/* KHU VỰC TEXTAREA */}
     {/* KHU VỰC TEXTAREA */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="group">
    <label className="text-xs font-bold text-slate-500 ml-4 group-focus-within:text-orange-500 transition-colors uppercase">Nội dung câu hỏi</label>
    <textarea
      className="w-full h-80 p-5 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 mt-2 shadow-inner focus:border-orange-400 focus:bg-white outline-none transition-all text-sm"
      placeholder="Ctrl + V nội dung từ file Word Latex vào đây..."
      value={jsonInputWord}
      onChange={e => setJsonInputWord(e.target.value)}
    />
  </div>
  <div className="group">
    <label className="text-xs font-bold text-slate-500 ml-4 group-focus-within:text-purple-500 transition-colors uppercase">Lời giải chi tiết</label>
    <textarea 
  className="w-full h-96 p-6 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 mt-2 shadow-inner focus:border-purple-400 focus:bg-white outline-none transition-all text-sm font-mono" 
  placeholder="Dán lời giải vào đây..."
  value={rawLGText}
  onChange={(e) => {
     setRawLGText(e.target.value);
     handleSolutionParser(e.target.value);
  }} 
/>
  </div>
</div>
      {/* MODAL REVIEW */}
      {isReviewing && (
        <div className="fixed inset-0 bg-slate-900/95 z-[999] p-4 flex items-center justify-center">
          <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="font-bold">KIỂM TRA NỘI DUNG</h2>
              <div className="flex gap-2">
                <button onClick={() => setIsReviewing(false)} className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">ĐÓNG</button>
                <button 
                  onClick={() => handleSaveQuestions(previewData)} 
                  className="px-6 py-2 bg-emerald-500 rounded-lg font-bold hover:bg-emerald-600 transition-colors"
                 
                >
                   {loading ? "ĐANG LƯU..." : "LƯU VÀO SHEET"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 space-y-6">
              {previewData.map((item, idx) => {
                let content = {};
                try { content = new Function(`return (${item.question})`)(); } catch (e) { content = { question: "Lỗi JSON!" }; }
                
                return (
                  <div key={idx} className="bg-white p-4 rounded-2xl shadow grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                    <span className="absolute -left-2 top-2 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full z-10">Câu {idx+1}</span>
                    
                    <textarea 
                      className="w-full h-64 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={item.question}
                      onChange={(e) => {
                        const newData = [...previewData];
                        newData[idx].question = e.target.value;
                        setPreviewData(newData);
                      }}
                    />

                    <div className="border border-slate-100 p-3 rounded-xl bg-slate-50 overflow-auto h-64">
                      <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Hiển thị thực tế:</div>
                      <div className="text-sm mb-3 font-medium text-slate-800" dangerouslySetInnerHTML={{ __html: content.question }} />
                      
                      {/* Trắc nghiệm MCQ */}
                      {content.o && !content.s && (
                        <div className="space-y-1 mb-3">
                          {content.o.map((opt, oIdx) => (
                            <div key={oIdx} className="text-xs flex gap-2 p-1.5 bg-white rounded border border-slate-100">
                              <b className="text-emerald-500">{String.fromCharCode(65 + oIdx)}.</b>
                              <div dangerouslySetInnerHTML={{ __html: opt }} />
                            </div>
                          ))}
                          <div className="mt-2 pt-2 border-t border-dashed text-red-500 text-xs font-bold">Đáp án: {content.a}</div>
                        </div>
                      )}

                     {/* Đúng/Sai TF - Bản sửa lỗi khớp đáp án từ trong mảng s */}
{content.s && Array.isArray(content.s) && (
  <div className="space-y-2 mb-3">
    <div className="text-[10px] text-blue-500 font-bold italic">Dạng Đúng/Sai:</div>
    {content.s.map((sub, sIdx) => {
      // THAY ĐỔI Ở ĐÂY: Lấy đáp án trực tiếp từ sub.a thay vì content.a[sIdx]
      const ans = sub.a; 
      
      return (
        <div key={sIdx} className="text-xs p-2 bg-blue-50/50 rounded-lg border border-blue-100 flex flex-col gap-1">
          <div className="flex gap-2">
            <b className="text-blue-600">{String.fromCharCode(97 + sIdx)})</b>
            <div dangerouslySetInnerHTML={{ __html: sub.text || sub }} />
          </div>
          <div className="ml-5 font-bold text-[10px]">
            {/* Kiểm tra giá trị ans */}
            {(ans === true || ans === "true") ? (
              <span className="text-emerald-600">● ĐÚNG</span>
            ) : (ans === false || ans === "false") ? (
              <span className="text-red-600">● SAI</span>
            ) : (
              <span className="text-slate-400 font-normal">Chưa xác định: {JSON.stringify(ans)}</span>
            )}
          </div>
        </div>
      );
    })}
  </div>
)}

                      {/* Điền khuyết SA */}
                      {content.type === "short-answer" && !content.o && !content.s && (
                        <div className="mt-3 pt-2 border-t border-dashed text-red-500 text-xs font-bold">Đáp án điền: {content.a}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TeacherWordTask;
