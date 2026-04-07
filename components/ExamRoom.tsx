import React, { useState, useEffect, useCallback, useRef } from 'react';
import { scoreWord } from '../scoreWord';

import Watermark from "./Watermark";
import WarningToast from "./WarningToast";
interface Question {
  id: string;
  type: 'mcq' | 'true-false' | 'sa' | 'short-answer'; 
  question: string;
  o?: string[];
  s?: any[];
  a?: string;
}

interface ExamRoomProps {
  questions: Question[];
  studentInfo: {
    idgv: string;
    sbd: string;
    name: string;
    className: string;
    examCode: string;
  };
  duration: number;
  minSubmitTime?: number; 
  maxTabSwitches?: number; 
  deadline?: string;  
  scoreMCQ?: number; // Cột D
  scoreTF?: number;  // Cột F
  scoreSA?: number;  // Cột H
  onFinish: () => void;
}
const formatContent = (text: any) => {
  if (!text) return "";
  let clean = String(text);

  // Chỉ nên replace xuống dòng bên ngoài khối toán học, 
  // nhưng tốt nhất hãy để MathJax tự xử lý.
  // clean = clean.replace(/\\n/g, "<br />"); 

  return clean.trim();
};
const QuestionCard = React.memo(({ q, idx, answer, onSelect }: any) => {
  console.log("TYPE:", typeof q.question, q.question);
  const qType = q.type ? q.type.toString().trim().toLowerCase() : "";
  return (
    <div className="bg-slate-900 border-2 border-slate-800 p-4 sm:p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden mb-10">
      <div className="flex items-center gap-4 mb-8">
        <span className="bg-emerald-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-black">{idx + 1}</span>
        <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest bg-slate-800 px-4 py-1 rounded-full">
          {qType === 'mcq' ? 'Phần I' : (qType === 'true-false' ? 'Phần II' : 'Phần III')}
        </span>
      </div>
     <div 
  className="text-base sm:text-xl md:text-2xl leading-relaxed mb-8 font-semibold text-slate-200 whitespace-normal overflow-visible" 
  style={{ minHeight: 'fit-content' }}
  dangerouslySetInnerHTML={{ __html: formatContent(q.question) }} 
/>
      
      {qType === 'mcq' && q.o && (
        <div className="grid grid-cols-1 gap-4">
          {q.o.map((opt: any, i: number) => {
            const label = String.fromCharCode(65 + i);
            const isSelected = answer === label;
            return (
              <button key={i} onClick={() => onSelect(idx, label)} className={`p-3 sm:p-4 md:p-5 rounded-2xl md:rounded-3xl text-left border-2 transition-all flex items-center gap-4 sm:gap-5 ${isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}>
                <span className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-black ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{label}</span>
                <div 
  className="text-lg font-medium text-slate-300 shadow-sm" // Thay text-slate-400 bằng text-white hoặc text-slate-100
  dangerouslySetInnerHTML={{ __html: formatContent(opt) }} 
/>
              </button>
            );
          })}
        </div>
      )}

      {qType === 'true-false' && (
        <div className="space-y-3">
          {(q.s || q.o || []).map((sub: any, sIdx: number) => {
            const subLabel = String.fromCharCode(65 + sIdx);
            const content = typeof sub === 'string' ? sub : (sub.text || "");
            return (
              <div key={sIdx} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-800 rounded-2xl bg-slate-800/30 gap-4">
                <div className="flex-1 text-slate-300 font-medium">
                  <span className="font-bold text-emerald-500 mr-2">{subLabel}.</span>
                  <span dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
                </div>
                <div className="flex gap-2">
                  {['Đúng', 'Sai'].map((label) => {
                    const isSelected = answer?.[subLabel] === label;
                    return (
                      <button key={label} onClick={() => onSelect(idx, { ...(answer || {}), [subLabel]: label })} className={`px-6 py-2 rounded-xl font-bold border-2 transition-all ${isSelected ? (label === 'Đúng' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-red-600 border-red-500 text-white') : 'bg-slate-700 border-slate-600 text-slate-400'}`}>{label}</button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(qType === 'sa' || qType === 'short-answer') && (
        <div className="mt-4 p-6 bg-slate-800/50 rounded-[2rem] border-2 border-slate-700 flex flex-col md:flex-row items-center gap-4">
  <span className="font-black text-emerald-400 shrink-0">ĐÁP ÁN:</span>

  <input
    type="text"
    inputMode="decimal"
    autoCorrect="off"
    autoCapitalize="off"
    placeholder="Ví dụ: 6.32 (dùng dấu (.) nhé)"
    value={answer || ''}
    onChange={(e) => onSelect(idx, e.target.value)}
    className="w-full bg-slate-900 border-2 border-slate-700 p-4 min-h-[44px] rounded-xl text-white font-bold text-center focus:border-emerald-500 outline-none text-base sm:text-xl md:text-2xl font-mono"
  />
</div>
      )}
    </div>
  );
}, (prev, next) => 
    prev.idx === next.idx && 
    JSON.stringify(prev.answer) === JSON.stringify(next.answer)
);
const parseCloseDate = (s?: string) => {
  if (!s) return null;
  const d = new Date(s + "T23:59:59");
  return isNaN(d.getTime()) ? null : d;
};
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function ExamRoom({ 
  questions = [], 
  studentInfo, 
  duration, 
  minSubmitTime = 0, // Để mặc định là 0 để test cho dễ
  maxTabSwitches = 3, 
  deadline = "", 
  scoreMCQ = 0.25, // THÊM DÒNG NÀY
  scoreTF = 1.0,   // THÊM DÒNG NÀY
  scoreSA = 0.5,   // THÊM DÒNG NÀY
  onFinish
}: ExamRoomProps) {

   const [tabPopup,setTabPopup] = useState(false)
  const [countdown,setCountdown] = useState(10)
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [startTime] = useState(new Date());
  const [tabSwitches, setTabSwitches] = useState(0);
  const [tabWarning, setTabWarning] = useState<number | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const answersRef = useRef(answers);
  const isSubmitting = useRef(false); // Chốt an toàn
  const [warning, setWarning] = useState<{
  message: string;
  count: number;
} | null>(null);
  // 1. CƠ CHẾ CHỐNG MỞ 2 TAB (Dùng Heartbeat để tự giải phóng nếu tắt tab đột ngột)
  useEffect(() => {
    const lockKey = `exam_active_${studentInfo.sbd}`;
    const sessionId = Math.random().toString(36).substring(7);
    
    const checkLock = () => {
      const lastActive = localStorage.getItem(lockKey);
      if (lastActive) {
        try {
          const { id, time } = JSON.parse(lastActive);
          // Nếu khóa chưa quá 5 giây và ID khác hiện tại mới chặn
          if (id !== sessionId && Date.now() - time < 5000) {
            alert("Bài thi đang được mở ở một tab khác hoặc phiên cũ chưa thoát hẳn!");
            onFinish();
            return false;
          }
        } catch (e) { /* Bỏ qua lỗi parse để ghi đè */ }
      }
      return true;
    };

    if (!checkLock()) return;

    // Gửi nhịp tim duy trì mỗi 2s
    const heartbeat = setInterval(() => {
      localStorage.setItem(lockKey, JSON.stringify({ id: sessionId, time: Date.now() }));
    }, 2000);

    return () => {
      clearInterval(heartbeat);
      localStorage.removeItem(lockKey);
    };
  }, [studentInfo.sbd, onFinish]);

    // 3. TỰ ĐỘNG LƯU & KHÔI PHỤC BÀI LÀM
  useEffect(() => {
    // Khôi phục ngay khi vào
    const saved = localStorage.getItem("exam_answers_" + studentInfo.sbd);
    if (saved) {
      try { setAnswers(JSON.parse(saved)); } catch (e) {}
    }

    // Thiết lập lưu tự động mỗi 2s
    const timer = setInterval(() => {
      localStorage.setItem(
        "exam_answers_" + studentInfo.sbd,
        JSON.stringify(answersRef.current)
      );
    }, 2000);

    return () => clearInterval(timer);
  }, [studentInfo.sbd]);
  // xác nhận khi F5 hay đóng Tab
  useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // Lưu bài một lần cuối trước khi reload/đóng tab
    localStorage.setItem("exam_answers_" + studentInfo.sbd, JSON.stringify(answersRef.current));
    
    e.preventDefault();
    e.returnValue = ""; // Trình duyệt hiện đại sẽ tự hiển thị thông báo cảnh báo mặc định
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [studentInfo.sbd]);
  

// Mỗi khi answers thay đổi, cập nhật Ref ngay lập tức
useEffect(() => {
  answersRef.current = answers;
}, [answers]);
  useEffect(()=>{
 localStorage.setItem(
   "exam_" + studentInfo.sbd,
   JSON.stringify(answers)
 );
},[answers]);
  useEffect(()=>{
 const saved = localStorage.getItem("exam_" + studentInfo.sbd);
 if(saved){
   setAnswers(JSON.parse(saved));
 }
},[]);
  useEffect(()=>{

 const remain = Math.max(0, maxTabSwitches - tabSwitches);

 if(remain < 3 && remain > 0){
   setTabPopup(true)
   setCountdown(10)
 }

},[tabSwitches])
  useEffect(()=>{

 if(!tabPopup) return

 const timer = setInterval(()=>{
   setCountdown(v=>{
     if(v<=1){
       clearInterval(timer)
       setTabPopup(false)
       return 0
     }
     return v-1
   })
 },1000)

 return ()=> clearInterval(timer)

},[tabPopup])   
 
  // ===== Hàm nộp bài đây nhé
  const handleFinish = useCallback(async (isAuto = false) => {
    
  // Nếu đang nộp rồi thì không chạy lại nữa
  if (isSubmitting.current) return;
    isSubmitting.current = true;
    const timeNow = new Date().getTime();
  const startTimeMs = startTime?.getTime?.() || timeNow;
  const timeSpentMin = Math.floor((timeNow - startTimeMs) / 60000);
  const timeTakenSeconds = Math.floor((timeNow - startTimeMs) / 1000);
        if (!isAuto) {
      if (timeSpentMin < minSubmitTime) {
        alert(`Cần tối thiểu ${minSubmitTime} phút để nộp. Còn ${minSubmitTime - timeSpentMin} phút.`);
          isSubmitting.current = false;
        return;
      }
          // 3. Nếu đủ thời gian -> Hiện xác nhận nộp bài
    const isConfirmed = window.confirm("Bạn có chắc chắn sẽ nộp bài không?");
    if (!isConfirmed) {
      isSubmitting.current = false; // Reset lại nếu người dùng bấm Hủy
      return; // Dừng hàm nếu bấm Hủy
    }
          console.log("Đang tiến hành nộp bài...");
    }

  
  try {   
    const currentAnswers = answersRef.current || {};
    
    console.log("🚀 Bắt đầu chấm điểm...", currentAnswers);

    // Kiểm tra xem scoreWord có tồn tại không để tránh crash
    if (typeof scoreWord !== 'function') {
      console.error("Lỗi: Hàm scoreWord chưa được định nghĩa!");
      isSubmitting.current = false;
      return;
    }

    const result = scoreWord(
      questions,
      currentAnswers,
      Number(scoreMCQ) || 0.25,
      Number(scoreTF) || 1.0,
      Number(scoreSA) || 0.5
    );

    console.log("✅ Chấm điểm xong:", result.totalScore);

    if (isAuto) alert("Vi phạm quy chế! Hệ thống tự động nộp bài.");

    // Gửi dữ liệu về
    const resultData = {
      tongdiem: result.totalScore.toString().replace('.', ','),
      time: timeTakenSeconds,
      timestamp: new Date().toLocaleString('vi-VN'),
      details: result.details
    };
    const res = await onFinish(resultData);

    if(res?.success !== false){
      localStorage.removeItem("exam_answers_" + studentInfo.sbd);
}

  } catch (error) {
    console.error("❌ Lỗi nghiêm trọng khi nộp bài:", error);
    isSubmitting.current = false; // Mở khóa nếu lỗi để có thể thử lại
  }
}, [startTime, minSubmitTime, questions, scoreMCQ, scoreTF, scoreSA, onFinish]);
  useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    // Nếu Tab khác vừa ghi nhận đã nộp bài cho SBD này
    if (e.key === `finished_${studentInfo.sbd}` && e.newValue === "true") {
      alert("Hệ thống ghi nhận bạn đã nộp bài ở một cửa sổ khác. Trang này sẽ tự động đóng.");
      window.location.reload(); // Hoặc điều hướng về trang chủ
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, [studentInfo.sbd]);
   const [currentIdx, setCurrentIdx] = useState(0); 
  // Thêm vào trong ExamRoom component
useEffect(() => {
  const activeBtn = document.getElementById(`q-btn-${currentIdx}`);
  if (activeBtn) {
    activeBtn.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }
}, [currentIdx]);
  // 3. RENDER MATHJAX (Để công thức không bị lỗi "trơ" mã LaTeX)
  useEffect(() => {
  const runMathJax = async () => {
    if ((window as any).MathJax?.typesetPromise) {
      await (window as any).MathJax.typesetPromise();
    }
  };

  runMathJax();
 }, [currentIdx, questions, answers]); // Thêm currentIdx vào đây
 

 
  
 useEffect(() => {
  const handleTab = () => {
    if (document.hidden && maxTabSwitches > 0) {
      setTabSwitches(v => {
        const next = v + 1;
        if (next < maxTabSwitches) {
          setTabWarning(next);
        }
        return next;
      });
    }
  };

  document.addEventListener("visibilitychange", handleTab);
  return () => document.removeEventListener("visibilitychange", handleTab);
}, [maxTabSwitches]);
useEffect(() => {
  if (
    maxTabSwitches > 0 &&
    tabSwitches >= maxTabSwitches &&
    !hasAutoSubmitted
  ) {
    setHasAutoSubmitted(true);
    setTimeout(() => {
  handleFinish(true);
}, 100);
  }
}, [tabSwitches, maxTabSwitches, hasAutoSubmitted, handleFinish]);


useEffect(() => {
  if (deadline) {
    const deadlineDate = new Date(deadline + "T23:59:59");
    if (new Date() > deadlineDate) {
      alert("Đề thi này đã đóng rồi bạn nhé! Hãy tìm đề khác để thi");
      onFinish();
      return;
    }
  }
}, [deadline, onFinish]);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(v => { if (v <= 1) { clearInterval(timer); handleFinish(true); return 0; } return v - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleFinish]);

  // Tự động đổi dấu phẩy thành dấu chấm khi học sinh nhập
  const handleSelect = useCallback((idx: number, val: any) => {
  let finalVal = val;
  if (questions[idx].type === 'sa' || questions[idx].type === 'short-answer') {
    if (typeof val === 'string') {
      finalVal = val.replace(',', '.'); // Học sinh gõ 6,5 nó tự nhảy thành 6.5
    }
  }
  setAnswers(p => ({ ...p, [idx]: finalVal }));
}, [questions]);
  const currentQuestion = questions[currentIdx];
  const remain = Math.max(0, maxTabSwitches - tabSwitches)
  
  return (  
 <div className="min-h-screen bg-slate-950 pb-24 sm:pb-20 relative">
   {/* WATERMARK CHẠY THEO TÊN HỌC SINH VÀ CÂU HỎI */}
      <Watermark 
        text={`${studentInfo.name} - ${studentInfo.sbd}`} 
        seed={currentIdx} 
      />
    {/* Toast cảnh báo */}
    {warning && (
      <WarningToast
        message={warning.message}
        count={warning.count}
        
      />
    )}
   {tabPopup && (
<div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">

<div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-xl text-center max-w-sm">

<div className="font-bold text-lg">
⚠️ Cảnh báo chuyển tab
</div>

<div className="text-sm mt-2">
Bạn chỉ còn <b>{remain} lần</b> chuyển tab.
</div>

<div className="text-xs mt-2 opacity-80">
Bạn phải chờ <b>{countdown}s</b> để cảnh báo tự tắt.
Bạn cố tình tắt cảnh báo này cũng tính 1 lần vi phạm.
</div>

<button
disabled={countdown>0}
className="mt-3 px-4 py-1 bg-white text-red-600 rounded font-bold disabled:opacity-40"
onClick={()=>{
setTabPopup(false)
}}
>
Đã hiểu rồi chứ bạn yêu!
</button>

</div>
</div>
)}
      {/* HEADER: DANH SÁCH CÂU HỎI VÀ THÔNG TIN */}
      <header className="flex flex-col bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
  {/* TẦNG 1: THÔNG TIN SINH VIÊN & ĐỒNG HỒ */}
<div className="flex items-center justify-between px-2 py-1.5 sm:p-3 max-w-7xl mx-auto w-full">
    <div className="flex flex-col max-w-[60%]">
      <span className="text-white font-bold text-xs sm:text-sm truncate uppercase">
        {studentInfo.name}
      </span>
      <div className="flex gap-3 text-[9px] font-semibold text-slate-400">
        <span>SBD: <span className="text-emerald-400">{studentInfo.sbd}</span></span>
        <span>|</span>
        <span className={tabSwitches >= maxTabSwitches ? 'text-red-500' : ''}>
          Tab: {tabSwitches}/{maxTabSwitches}
        </span>
         <span>|</span>
         <span className={tabSwitches >= maxTabSwitches ? 'text-red-500' : ''}>
          Mã: {studentInfo.examCode}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <div className="bg-slate-800 px-2 py-1 rounded-lg font-mono text-base sm:text-lg text-emerald-400 border border-slate-700">
        {formatTime(timeLeft)}
      </div>
      <button 
  onClick={() => handleFinish(false)}
  className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs active:scale-95"
>
  NỘP BÀI
</button>
    </div>
  </div>

  {/* TẦNG 2: DANH SÁCH CÂU HỎI - ÉP CỨNG 1 DÒNG ĐỂ TIẾT KIỆM DIỆN TÍCH */}  
    <div className="flex items-center gap-2 overflow-x-auto scroll-smooth py-2 px-3 border-t border-slate-800/50 no-scrollbar touch-pan-x bg-slate-900/50">
      
    {questions.map((q, idx) => {
  const isDone = answers[idx] !== undefined && answers[idx] !== null;
  const isCurrent = currentIdx === idx;

  const type = (q.type || "").toLowerCase();

  let partColor = "bg-slate-800 text-slate-400 border border-slate-700";

  if (type === "mcq")
    partColor = "bg-blue-100 text-blue-700 border border-blue-300";

  else if (type === "true-false")
    partColor = "bg-orange-100 text-orange-700 border border-orange-300";

  else if (type === "sa" || type === "short-answer")
    partColor = "bg-purple-100 text-purple-700 border border-purple-300";

  return (
    <button
      key={idx}
      id={`q-btn-${idx}`}
      onClick={() => setCurrentIdx(idx)}
      className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-sm font-black transition-all duration-300

      ${
        isCurrent
          ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)] scale-105"
          : isDone
          ? "bg-blue-700 text-white border border-blue-800"
          : partColor
      }
      `}
    >
      {idx + 1}
    </button>
  );
})}
  </div>
</header>    

      {/* NỘI DUNG CÂU HỎI HIỆN TẠI */}
      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-6">
        {/* Gọi trực tiếp questions[currentIdx] để tránh lỗi chập chờn */}
        {questions[currentIdx] ? (
          <QuestionCard 
            key={currentIdx + "-" + questions[currentIdx]?.id}
            q={questions[currentIdx]} 
            idx={currentIdx} 
            answer={answers[currentIdx]} 
            onSelect={handleSelect} 
          />
        ) : (
          <div className="text-center text-slate-500">Đang tải câu hỏi...</div>
        )}

        {/* Nút điều hướng chân trang */}
      <div className="grid grid-cols-2 gap-4 mt-6 sticky bottom-2">
  <button 
    disabled={currentIdx === 0}
    onClick={() => setCurrentIdx(prev => prev - 1)}
    className="py-3 sm:py-4 rounded-2xl bg-slate-800 text-white font-bold disabled:opacity-20 flex items-center justify-center gap-2"
  >
    <i className="fa-solid fa-chevron-left"></i> Câu trước
  </button>
  
  <button 
    disabled={currentIdx === questions.length - 1} 
    onClick={() => setCurrentIdx(prev => prev + 1)}
    className="py-3 sm:py-4 rounded-2xl bg-blue-600 text-white font-bold disabled:opacity-20 flex items-center justify-center gap-2"
  >
    Câu tiếp <i className="fa-solid fa-chevron-right"></i>
  </button>
</div>
      </main>
    </div>
  );
}

  
