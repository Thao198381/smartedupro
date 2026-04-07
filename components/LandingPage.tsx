import React, { useState, useEffect, useMemo } from 'react';
import { DANHGIA_URL, ADMIN_CONFIG, OTHER_APPS, KETQUA_URL, ADMIN2_URL, } from '../config';
import { AppUser, Student } from '../types';
import { postToScript } from '../postToScript';
import ExamRoom from './ExamRoom';
import { fetchScore } from '../questions';



interface LandingPageProps {
  onSelectGrade: (grade: number) => void;
  onSelectQuiz: (num: number, pts: number, quizStudent: Partial<Student>) => void;
  user: AppUser | null;
  onOpenAuth: () => void;
  onOpenVip: () => void;
  setView: (mode: 'matran' | 'cauhoi' | 'word' | 'admin') => void;
  onOpenTeacherTask: () => void;
}
interface UserAcc {
  phoneNumber: string;
  vip: string;
}
const LandingPage: React.FC<LandingPageProps> = ({
  onSelectGrade,
  onSelectQuiz,
  user,
  onOpenAuth,
  onOpenVip,
  onOpenTeacherTask,
  setView
}) => {
  // ỨNG DỤNG KHÁC
  const EXTRA_APPS_DATA = [
  { name: "Word-PDF-IMG To Latex", icon: "fas fa-sync-alt", link: "https://convertword.vercel.app/" },
  { name: "Tạo câu tương tự từ ảnh, PDF", icon: "fas fa-clone", link: "https://taocautuongtu.vercel.app/" },
  { name: "Vòng quay may mắn", icon: "fas fa-dharmachakra", link: "https://vongquaymayman-fawn.vercel.app/" },  
  { name: "Học tiếng anh cùng chuyên gia", icon: "fas fa-language", link: "https://online.activeskills.vn?ref=activeskills" },
  { name: "Máy tính Online", icon: "fas fa-calculator", link: "https://www.desmos.com/scientific" },
  { name: "Quản lý học thêm thông minh", icon: "fas fa-graduation-cap", link: "https://quanlyhocthem-theta.vercel.app/" },
  { name: "App dành cho GVCN", icon: "fas fa-user-tie", link: "https://teacherassistant-jet.vercel.app/" },
];
  // --- GIỮ NGUYÊN TOÀN BỘ LOGIC DỮ LIỆU CỦA THẦY ---
  const REDIRECT_LINKS: Record<string, string> = { "default": "https://www.facebook.com/hoctoanthayha.bg" };
  // Thêm/Kiểm tra dòng này ở đầu Component
  const [appConfig, setAppConfig] = useState({ topics: [], classes: [] });
  const [showNotice, setShowNotice] = useState(false); // 110326
  const [maxthi, setMaxthi] = useState(1); // 110326
  const [countdown, setCountdown] = useState(20); // 110326
  const [showIdgvModal, setShowIdgvModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  
  const [showResetMenu, setShowResetMenu] = useState(false);    
  const [resetMode, setResetMode] = useState("all");
  const [examsList, setExamsList] = useState<string[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetExams, setResetExams] = useState("");
  const [resetPassword, setResetPassword] = useState("");
 const [resetType, setResetType] = useState<"ketqua" | "matran" | "exams" | "exam_data">("ketqua");



  const [loadingScore, setLoadingScore] = useState(false); 
  const [sbd, setSbd] = useState('');
  const [exams, setExams] = useState('');
  const [minSubmitTime, setMinSubmitTime] = useState(0);
  const [maxTabSwitches, setMaxTabSwitches] = useState(3);
  const [deadline, setDeadline] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [scoreMCQ, setScoreMCQ] = useState(0.25);
  const [scoreTF, setScoreTF] = useState(1.0);
  const [scoreSA, setScoreSA] = useState(0.5);
   const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [showAppList, setShowAppList] = useState(false);
  const [isOtherBank, setIsOtherBank] = useState(false);
  const [quizMode, setQuizMode] = useState<'free' | 'gift' | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [currentImg, setCurrentImg] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState<{ num: number, pts: number } | null>(null);
  const [quizInfo, setQuizInfo] = useState({ name: '', class: '', school: '', phone: '' });
  const [bankInfo, setBankInfo] = useState({ stk: '', bankName: '' });
  const [serverPassword, setServerPassword] = useState("");
  const [isOtherSchool, setIsOtherSchool] = useState(false);
  const [isOtherClass, setIsOtherClass] = useState(false);
  const [showVipOptions, setShowVipOptions] = useState(false);
  const [showVipBenefits, setShowVipBenefits] = useState(false);
  const [showLichOptions, setshowLichOptions] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [isMatrixOpen, setIsMatrixOpen] = useState(false); // Đóng/mở bảng ma trận
  const [loadingMatrix, setLoadingMatrix] = useState(false); //
  const [idgv, setIdgv] = useState('');
  const [questions, setQuestions] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [duration, setDuration] = useState(90);          
  const [examStarted, setExamStarted] = useState(false);
  const [studentClass, setStudentClass] = useState("");
 
 
 
  const [searchId, setSearchId] = useState('');
  const [foundLG, setFoundLG] = useState(null);
  const [showModal, setShowModal] = useState(false); 

 const [loadingLG, setLoadingLG] = useState(false); // Để hiện trạng thái đang tìm

// Công tắc đóng mở Modal nhập thông tin
const [showStudentLogin, setShowStudentLogin] = useState(false);

// Nơi chứa dữ liệu HS nhập vào (IDGV, SBD, Mã Đề)
const [studentInfo, setStudentInfo] = useState({ idgv: '', sbd: '', examCode: '' });


  // Trạng thái chờ khi đang xác thực
const [loading, setLoading] = useState(false);
  
  const toArray = (v: any) => {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  return v
    .toString()
    .split(',')
    .map(x => x.trim())
    .filter(x => x !== '')
    .map(x => isNaN(Number(x)) ? x : Number(x));
};

  
  const [maTranForm, setMaTranForm] = useState({
  makiemtra: '',
  name: '',
  duration: '',
  topics: '',
  numMC: '',
  scoreMC: '',
  mcL3: '',
  mcL4: '',
  numTF: '',
  scoreTF: '',
  tfL3: '',
  tfL4: '',
  numSA: '',
  scoreSA: '',
  saL3: '',
  saL4: ''
});
  
    // Form ma trận mới 12/03/26
  const [selectedTopics, setSelectedTopics] = useState([
  { idcd: '', numMC: 0, mcL3: 0, mcL4: 0, numTF: 0, tfL3: 0, tfL4: 0, numSA: 0, saL3: 0, saL4: 0 }
]);

  // Hàm thêm dòng chuyên đề mới
const addTopicRow = () => {
  setSelectedTopics([...selectedTopics, { idcd: '', numMC: 0, mcL3: 0, mcL4: 0, numTF: 0, tfL3: 0, tfL4: 0, numSA: 0, saL3: 0, saL4: 0 }]);
};


 // 1. Khai báo state để chứa danh sách ứng dụng

 
const [extraApps, setExtraApps] = useState([]);
  const [useracc, setUseracc] = useState<UserAcc | null>(null);
const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
const [authForm, setAuthForm] = useState({ phone: '', pass: '' });
const [subjectData, setSubjectData] = useState<any[]>([]); // Lưu toàn bộ hàng từ sheet 
const [dynamicSubjects, setDynamicSubjects] = useState<string[]>([]); // Danh sách môn duy nhất
const [dynamicLevels, setDynamicLevels] = useState<string[]>([]); // Danh sách cấp học duy nhất
   const [matrixTopics, setMatrixTopics] = useState([]); // Danh sách chuyên đề cho ma trận
  const [selectedGrade, setSelectedGrade] = useState(12);
  // ảnh và tin tức
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
const [newsList, setNewsList] = useState<{t: string, l: string}[]>([]);
   useEffect(() => {
  // Giả sử bạn dùng google.script.run để gọi hàm từ backend GAS
  if (typeof google !== 'undefined') {
    google.script.run
      .withSuccessHandler((data) => {
        console.log("✅ Đã tải Config:", data);
        setAppConfig(data);
      })
      .execute('getAppConfig');
  }
}, []);

 

// 1. Nạp cấu hình riêng cho ma trận
 useEffect(() => {
  const loadMatrixData = async () => {
    try {
      // Gọi đúng action getAppConfigmt và thêm redirect: "follow"
      const response = await fetch(`${KETQUA_URL}?action=getAppConfigmt`, {
        method: "GET",
        redirect: "follow"
      });
      const result = await response.json();
      
      // Kiểm tra và gán vào State mới
      if (result.status === "success" && result.data) {
        setMatrixTopics(result.data.topics || []);
        console.log("✅ Ma trận: Đã nạp xong chuyên đề");
      }
    } catch (err) {
      console.error("❌ Ma trận: Lỗi nạp dữ liệu:", err);
    }
  };
  loadMatrixData();
}, [KETQUA_URL]);
 

  
// 2. Hàm tính toán tổng điểm (Dùng để hiển thị nhanh trên UI)
const scoreInfo = (() => {
  const sMC = parseFloat(maTranForm.scoreMC) || 0;
  const sTF = parseFloat(maTranForm.scoreTF) || 0;
  const sSA = parseFloat(maTranForm.scoreSA) || 0;
  const tMC = selectedTopics.reduce((sum, t) => sum + (parseInt(t.numMC) || 0), 0);
  const tTF = selectedTopics.reduce((sum, t) => sum + (parseInt(t.numTF) || 0), 0);
  const tSA = selectedTopics.reduce((sum, t) => sum + (parseInt(t.numSA) || 0), 0);
  return {
    total: ((tMC * sMC) + (tTF * sTF) + (tSA * sSA)).toFixed(2),
    qCount: tMC + tTF + tSA
  };
})();
  
   useEffect(() => {
  if (window.MathJax && foundLG) {
    window.MathJax.typesetPromise();
  }
}, [foundLG]);
  useEffect(() => {
  const fetchContentData = async () => {
    try {
      const sheetId = '16w4EzHhTyS1CnTfJOWE7QQNM0o2mMQIqePpPK8TEYrg'; // ID file admin2 của thầy
      const gid = '1501357631'; // THẦY THAY GID CỦA SHEET linkimg VÀO ĐÂY
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;

      const response = await fetch(url);
      const data = await response.text();
      const rows = data.split('\n').slice(1);

      const parsedImages: string[] = [];
      const parsedNews: {t: string, l: string}[] = [];      

      rows.forEach(row => {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());        
        // Cột A: Link ảnh (linkimg)
        if (cols[0]) parsedImages.push(cols[0]);
                // Cột B: Tên tin tức (tentinuc), Cột C: Link tin tức (linktintuc)
        if (cols[1]) {
          parsedNews.push({ t: cols[1], l: cols[2] || "#" });
        }
      });
      setCarouselImages(parsedImages);
      setNewsList(parsedNews);
    } catch (error) {
      console.error("Lỗi tải ảnh và tin tức:", error);
    }
  };
  fetchContentData();
}, []);

  // Admin quản lý
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [adminApps, setAdminApps] = useState([]);
  const handleAdminLogin = async () => {
  if (showAdminMenu) {
    setShowAdminMenu(false);
    return;
  }

  const inputID = prompt("Nhập ID Admin:");
  if (!inputID) return;
  const inputPass = prompt("Nhập mật khẩu Admin:");
  if (!inputPass) return;

  setLoading(true);
  try {    
    // Gửi yêu cầu với các tham số id và pass
    const response = await fetch(
      `${DANHGIA_URL}?action=getAdminApps&id=${encodeURIComponent(inputID)}&pass=${encodeURIComponent(inputPass)}`
    );
    const result = await response.json();

    // Lưu ý: Dữ liệu của bạn nằm trong result.status.success và result.status.data
    if (result.status && result.status.success) {
      setAdminApps(result.status.data); // Gán mảng 3 admin vào state
      setShowAdminMenu(true);
    } else {
      alert("Thông tin đăng nhập không chính xác hoặc lỗi Server!");
    }
  } catch (error) {
    alert("Lỗi kết nối hệ thống! Vui lòng thử lại.");
    console.error("Fetch Error:", error);
  } finally {
    setLoading(false);
  }
};
  // Admin
  // =================================xem điểm ============================
 const handleViewScore = async () => {
  setLoadingScore(true);

  const result = await fetchScore(
    idgv.trim(),
    sbd.trim(),
    exams.trim()
  );

  setLoadingScore(false);

  if (!result) {
    alert("Không tìm thấy kết quả!");
    return;
  }

  setScoreData(result);
};
  
// ==================================== Reset chung ================================================================   
 useEffect(() => {
  const saved = localStorage.getItem('idgv');
  if (saved) {
    try {
      setIdgv(atob(saved));
    } catch (e) {
      console.error("Lỗi giải mã IDGV");
    }
  }
}, []); 
  useEffect(() => {
  if (!showResetModal) return;
  if (!idgv || !resetType) return;

  const fetchExams = async () => {
    try {      
      const baseUrl = KETQUA_URL;
      if (!baseUrl) {
  console.log("IDGV không tồn tại");
  return;
    }
      const res = await fetch(
        `${baseUrl}?action=getExamsList&type=${resetType}`
      );

      const data = await res.json();

      if (data?.status === "success") {
      setExamsList(Array.isArray(data.data) ? data.data : []);
      } else {
      setExamsList([]);
    }
    } catch (err) {
      console.error("Lỗi load list:", err);
    }
  };
  fetchExams();
}, [showResetModal, idgv, resetType]);
  // HÀM reset chung==================================================================================================================================================================
  const handleReset = async () => {
  if (!idgv) return alert("Nhập ID giáo viên");
  if (!resetPassword) return alert("Nhập mật khẩu");

  if (resetMode === "byExams" && !resetExams) {
    return alert("Chọn mã exams");
  }
  const baseUrl = KETQUA_URL;
  if (!baseUrl) return alert("IDGV không tồn tại");

  const confirmDelete = window.confirm(
    "⚠️ Hành động này không thể hoàn tác. Bạn chắc chắn?"
  );
  if (!confirmDelete) return;

  try {
    const res = await fetch(
      `${baseUrl}?action=resetData` +
      `&type=${resetType}` +
      `&password=${encodeURIComponent(resetPassword)}` +
      `&mode=${resetMode}` +
      `&exams=${resetExams || ""}`
    );

    const data = await res.json();

    if (data?.status === "success") {
  alert(data.message || "Đã xóa thành công");
} else {
  alert(data?.message || "Lỗi không xác định");
}

  } catch (err) {
    alert("Không kết nối được server");
  }
};
  // 
  const callResetAPI = async (action, extraParams = {}) => {
  try {
    if (!idgv) {
      alert("Chưa nhập IDGV");
      return;
    }

    const url = KETQUA_URL;
    if (!url) {
      alert("Không tìm thấy API của giáo viên này");
      return;
    }

    const params = new URLSearchParams({
      action,
      ...extraParams
    });

    const res = await fetch(`${url}?${params.toString()}`);
    const data = await res.json();

    alert(data.message);
  } catch (err) {
    console.error(err);
    alert("Lỗi kết nối server");
  }
};
   // =================================================================================================================
 // TRONG REACT - Hàm handleStudentSubmit
// Thêm (e) vào đây thầy nhé
const handleStudentSubmit = async (e) => {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  const currentIDGV = studentInfo.idgv.toString().trim();
  const targetUrl = KETQUA_URL;

  if (!targetUrl) {
    alert(`❌ Không tìm thấy link Script của mã GV: "${currentIDGV}"`);
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "studentGetExam",
        sbd: studentInfo.sbd.toString().trim(),
        examCode: studentInfo.examCode.toString().trim(),
        idgv: currentIDGV
      }),
    });

    const result = await response.json();

    if (result.status === "success") {
      // Cập nhật dữ liệu từ GAS vào State của LandingPage
      if (result.data.questions) setQuestions(result.data.questions); 
      
      // Lưu tên học sinh và thời gian thi vào state để truyền cho ExamRoom
      const d = result.data;
      setMaxthi(Number(d.maxthi) || 1);  
      setCountdown(20);
      setQuestions(d.questions || []);
      setDuration(Number(d.duration) || 90);
      setMinSubmitTime(Number(d.minSubmitTime ?? 0));  // Thêm State này
      setMaxTabSwitches(Number(d.maxTabSwitches) || 99); // Thêm State này
      setDeadline(d.deadline || "");
      setOpenTime(d.openTime || "");
      // 🔥 2. CẬP NHẬT ĐIỂM SỐ TỪ DATABASE (QUAN TRỌNG NHẤT)
      // Giả sử thầy đã khai báo const [scoreMCQ, setScoreMCQ] = useState(0.25) ở trên
      if (typeof setScoreMCQ === 'function') setScoreMCQ(d.scoreMCQ);
      if (typeof setScoreTF === 'function') setScoreTF(d.scoreTF);
      if (typeof setScoreSA === 'function') setScoreSA(d.scoreSA);
      const nameFromGas = result.data.studentName || "Thí sinh";
      const timeFromGas = result.data.duration || 90;
      const classFromGas = result.data.studentClass || "HS Tự do";
      
      setStudentName(nameFromGas);
      setDuration(timeFromGas);
      setStudentClass(classFromGas);

      // Cập nhật lại object studentInfo để có đủ tên (hiển thị trong ExamRoom)
      setStudentInfo({
        ...studentInfo,
        name: nameFromGas,
        className: classFromGas
      });

      setExamStarted(true); 
      setShowStudentLogin(false);
      
     setShowNotice(true);
    } else {
      alert("⚠️ " + result.message);
    }
  } catch (error) {
    console.error("Lỗi thực thi:", error);
    alert("❌ Không thể kết nối tới máy chủ.");
  }
};
  // =========================================Ghi ma trận========================================================================

const handleSaveMatrix = async () => {
  // 1. Kiểm tra ID Giáo viên
  if (!idgv) {
    alert("❌ Lỗi: Không xác định được ID Giáo viên!");
    return;
  }

  // 2. BƯỚC LỌC THÔNG MINH: Chỉ lấy những dòng đã chọn Chuyên đề
  const validRows = selectedTopics.filter(t => t.idcd !== "" && t.idcd !== undefined);

  if (validRows.length === 0) {
    alert("⚠️ Bạn chưa chọn chuyên đề nào trong bảng ma trận!");
    return;
  }

  // 3. Tự động chọn Link Script dựa trên mã IDGV
  const targetURL = KETQUA_URL;

  // 4. Gom dữ liệu vào Payload
  const payload = {
    gvId: idgv,
    makiemtra: maTranForm.makiemtra,
    name: maTranForm.name,
    duration: maTranForm.duration,

    // Chuyển mảng thành chuỗi phân cách bởi dấu phẩy
    topics: validRows.map(t => t.idcd).join(', '),
    
    numMC: validRows.map(t => t.numMC || 0).join(', '),
    mcL3: validRows.map(t => t.mcL3 || 0).join(', '),
    mcL4: validRows.map(t => t.mcL4 || 0).join(', '),

    numTF: validRows.map(t => t.numTF || 0).join(', '),
    tfL3: validRows.map(t => t.tfL3 || 0).join(', '),
    tfL4: validRows.map(t => t.tfL4 || 0).join(', '),

    numSA: validRows.map(t => t.numSA || 0).join(', '),
    saL3: validRows.map(t => t.saL3 || 0).join(', '),
    saL4: validRows.map(t => t.saL4 || 0).join(', '),

    // Điểm số lấy từ Form nhập liệu
    scoreMC: maTranForm.scoreMC || 0.25,
    scoreTF: maTranForm.scoreTF || 1.0,
    scoreSA: maTranForm.scoreSA || 0.5
  };
 console.log("🚀 Payload gửi đi:", payload);
  // 5. Gửi dữ liệu đi
  try {
    const response = await fetch(`${targetURL}?action=saveMatrix`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === "success") {
      alert("✅ " + result.message);
      if (typeof setIsMatrixOpen === "function") setIsMatrixOpen(false); // Đóng modal nếu thành công
    } else {
      alert("⚠️ Lỗi Script: " + result.message);
    }
  } catch (e) {
    console.error("Lỗi Save Matrix:", e);
    alert("❌ Lỗi kết nối! Kiểm tra Console để biết chi tiết.");
  }
};


  // kết thuc form ma trận mới
  // Tìm câu hỏi
// Tìm câu hỏi
const handleSearchLG = async () => {
  if (!searchId) return alert("Nhập mã ID đã thầy ơi!");
  setLoadingLG(true);
  try {
    const response = await fetch(`${KETQUA_URL}?action=getLG&id=${searchId}`);
    const text = await response.text();
    
    // Tìm phần nội dung sau "a:" và bóc tách nó ra khỏi dấu ngoặc kép
    const match = text.match(/a\s*:\s*["']([\s\S]*)["']\s*}/) || text.match(/loigiai\s*:\s*["']([\s\S]*)["']/);
    
    if (match && match[1]) {
      setFoundLG(match[1].trim()); // Chỉ lấy nội dung thuần túy
    } else {
      setFoundLG(text.replace(/["'{}]/g, "").trim()); // Nếu không khớp, xóa hết ký tự rác
    }
  } catch (error) {
    setFoundLG("Lỗi kết nối máy chủ!");
  } finally {
    setLoadingLG(false);
  }
};
const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();
  const url = `${DANHGIA_URL}?action=${authMode}&phone=${authForm.phone}&pass=${authForm.pass}`;
  
  try {
    const res = await fetch(url);
    const text = await res.text();
    
    if (authMode === 'register') {
      if (text === 'success') {
        alert("🎉 Đăng ký thành công! Giờ em có thể đăng nhập.");
        setAuthMode('login');
      } else if (text === 'exists') {
        alert("⚠️ Số điện thoại này đã được đăng ký rồi!");
      }
    } else {
      try {
        const data = JSON.parse(text);
        if (data.status === 'success') {
          const userData = { phoneNumber: data.phoneNumber, vip: data.vip };
          setUseracc(userData);
          localStorage.setItem('useracc_session', JSON.stringify(userData));
          setAuthMode(null);
        }
      } catch {
        alert("❌ Sai số điện thoại hoặc mật khẩu!");
      }
    }
  } catch (err) {
    alert("🚀 Lỗi kết nối máy chủ, vui lòng thử lại!");
  }
};
  // chọn môn
  useEffect(() => {

  const fetchSubjects = async () => {

    try {

      const sheetId = '16w4EzHhTyS1CnTfJOWE7QQNM0o2mMQIqePpPK8TEYrg';
      const gid = '1221175482';
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;    

      const response = await fetch(url);

      const data = await response.text();      

      // Tách các hàng

      const rows = data.split('\n').slice(1);       

      const parsedData = rows.map(row => {

        // Regex này giúp tách chuẩn CSV ngay cả khi có dấu phẩy nằm trong ngoặc kép

        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());

        return { 
          mon: cols[0], 
          caphoc: cols[1], 
          chonmon: cols[2], 
          link: cols[3] 
        };
      }).filter(item => item.mon && item.mon !== ""); // Lọc bỏ hàng trống
      setSubjectData(parsedData);   

      // Lấy danh sách Môn học (Cột A)
      const mons = [...new Set(parsedData.map(item => item.mon))].filter(Boolean);

      setDynamicSubjects(mons);      

      // Lấy danh sách Cấp học (Cột B)
      const caps = [...new Set(parsedData.map(item => item.caphoc))].filter(Boolean);
      setDynamicLevels(caps);
      console.log("Dữ liệu môn học đã tải:", parsedData); // Thầy F12 xem có hiện data chưa
    } catch (error) {
      console.error("Lỗi lấy dữ liệu môn học:", error);
    }
  };
  fetchSubjects();
}, []);
  
// đếm ngược
  useEffect(() => {
  if (!showNotice) return;

  if (countdown === 0) {
    setShowNotice(false);
    return;
  }

  const timer = setTimeout(() => {
    setCountdown((c) => c - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [showNotice, countdown]);
// 2. Trong useEffect hiện có của bạn, hãy thêm đoạn này:
  useEffect(() => {
  const saved = localStorage.getItem('useracc_session');
  if (saved) setUseracc(JSON.parse(saved));
}, []);
useEffect(() => {
  const fetchOtherApps = async () => {
    try {
      // Sử dụng DANHGIA_URL của bạn
      const response = await fetch(`${DANHGIA_URL}?sheet=ungdung`);
      const data = await response.json();
      
      // Kiểm tra nếu data là mảng thì mới set
      if (Array.isArray(data)) {
        setExtraApps(data);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu ứng dụng:", error);
    }
  };
  fetchOtherApps();
}, [DANHGIA_URL]); // Thêm DANHGIA_URL vào dependency để an toàn
  
  const [stats, setStats] = useState<{ ratings: Record<number, number>, top10: any[] }>({
    ratings: {},
    top10: []
  });
  const [schedules, setSchedules] = useState<{ grade: string, time: string }[]>([]);
useEffect(() => {
const fetchSchedules = async () => {
try {
// Lịch học
const sheetId = '16w4EzHhTyS1CnTfJOWE7QQNM0o2mMQIqePpPK8TEYrg'; 
const sheetName = 'lichhoc';
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
const response = await fetch(url);
const data = await response.text();
// Chuyển đổi CSV sang mảng Object
const rows = data.split('\n').slice(1); // Bỏ dòng tiêu đề đầu tiên
const parsedSchedules = rows.map(row => {
// Tách cột bằng dấu phẩy, loại bỏ dấu ngoặc kép thừa
const cols = row.split(',').map(c => c.replace(/"/g, '').trim());
return { grade: cols[0], time: cols[1] };
}).filter(item => item.grade); // Lọc bỏ dòng trống
setSchedules(parsedSchedules);
} catch (error) {
console.error("Lỗi lấy lịch học:", error);
}
};
fetchSchedules();
}, []);

useEffect(() => { console.log("Danh sách chuyên đề hiện có:", appConfig?.topics); }, [appConfig]);
  // --- CÁC HÀM XỬ LÝ ---
  // lấy ảnh logo
 useEffect(() => {
  // Nếu chưa tải xong ảnh từ Sheet thì không chạy đếm giây
  if (carouselImages.length === 0) return;

 const interval = setInterval(() => {
  if (document.hidden) return;
  setCurrentImg(prev => (prev + 1) % carouselImages.length);
}, 4000);

  return () => clearInterval(interval);
}, [carouselImages]); // Sẽ chạy lại mỗi khi danh sách ảnh từ Sheet thay đổi

  useEffect(() => {
    const fetchTop10 = async () => {
      try {
        const res = await fetch(`${DANHGIA_URL}?type=top10`);
        const json = await res.json();
        const data = json.data || json;
        if (Array.isArray(data)) setStats(prev => ({ ...prev, top10: data }));
      } catch (e) { console.error("Lỗi lấy dữ liệu Top 10:", e); }
    };
    fetchTop10();
    const interval = setInterval(fetchTop10, 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const res = await fetch(`${DANHGIA_URL}?type=getPass`);
        const data = await res.json();
        if (data?.password) setServerPassword(data.password.toString());
      } catch (e) {
        console.error("Lỗi lấy mật khẩu:", e);
      }
    };
    fetchPassword();
  }, []);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizMode === 'gift' && inputPassword !== serverPassword) return alert("Mật khẩu sai!");
    onSelectQuiz(showQuizModal!.num, showQuizModal!.pts, {
      ...quizInfo,
      phoneNumber: quizInfo.phone,
      stk: quizMode === 'gift' ? bankInfo.stk : "Tự do",
      bank: quizMode === 'gift' ? bankInfo.bankName : "Tự do",
      className: quizInfo.class,
      school: quizInfo.school
    });
    setShowQuizModal(null);
  };
// hàm chọn môn khác
const handleRedirect = () => {
  // Hàm chuẩn hóa cực mạnh: Xóa khoảng trắng, chuyển chữ thường, đưa về cùng một chuẩn Unicode (NFC)
  const normalize = (str) => 
    (str || "").toString().normalize("NFC").toLowerCase().trim();

  const userMon = normalize(selectedSubject);
  const userCap = normalize(selectedLevel);

  // Tìm trong data
  const match = subjectData.find(item => {
    const sheetMon = normalize(item.mon);
    const sheetCap = normalize(item.caphoc);
    return sheetMon === userMon && sheetCap === userCap;
  });

  if (match && match.link && match.link.toLowerCase().startsWith('http')) {
    window.open(match.link.trim(), '_blank');
  } else {
    // Nếu vẫn không khớp (rất hiếm), thử so sánh với cột C (chonmon)
    const userCombined = normalize(`${selectedSubject}-${selectedLevel}`);
    const matchCombined = subjectData.find(item => normalize(item.chonmon) === userCombined);
    
    if (matchCombined && matchCombined.link) {
      window.open(matchCombined.link.trim(), '_blank');
    } else {
      // Trường hợp cuối cùng không thấy thì về Facebook
      window.open("https://www.facebook.com/hoctoanthayha.bg", '_blank');
      console.log("Thử mọi cách vẫn không khớp:", userMon, userCap);
    }
  }
  
  setShowSubjectModal(false);
};
  const handleFinishExam = async (resultData) => {
  // resultData chứa { tongdiem, time, timestamp, details } truyền từ ExamRoom sang
  setExamStarted(false); 

  const currentIDGV = studentInfo.idgv.toString().trim();
  const targetUrl = KETQUA_URL;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "submitExam", // Hành động ghi điểm
        sbd: studentInfo.sbd,
        examCode: studentInfo.examCode,
        className: studentInfo.className,
        idgv: currentIDGV,
        name: studentInfo.name,
        ...resultData // Đẩy toàn bộ tongdiem, time... vào body
      }),
    });

    const finalRes = await response.json();
    if (finalRes.status === "success") {
      alert("✅ Đã lưu kết quả vào hệ thống!");
    }
  } catch (error) {
    console.error("Lỗi gửi điểm:", error);
    alert("❌ Lỗi kết nối, không thể lưu điểm. Hãy chụp màn hình kết quả!");
  }
};
  const updateTopicRow = (index, field, value) => {
    const newTopics = [...selectedTopics];
    newTopics[index][field] = value;
    setSelectedTopics(newTopics);
  };
   const getAllowedGrades = (grade) => {
  const g = Number(grade);

  if (g === 12) return [12, 11, 10];
  if (g === 11) return [11, 10];
  if (g === 10) return [10];

  return [g];
};
   // ==== Lọc theo lớp ================
  const filteredTopics = useMemo(() => {

  const allowed = getAllowedGrades(selectedGrade);

  return matrixTopics
    .filter(t => allowed.includes(Number(t.grade)))
    .sort((a,b) => Number(b.grade) - Number(a.grade));

}, [matrixTopics, selectedGrade]);
  return (
    <>
    {/* TRƯỜNG HỢP 1: ĐANG THI (Hiện phòng thi, ẩn toàn bộ Landing) */}
    {examStarted ? (
  <div className="animate-in slide-in-from-bottom duration-500">
    <ExamRoom 
      questions={questions} 
      studentInfo={studentInfo}
      duration={duration} 
      minSubmitTime={minSubmitTime}
      maxTabSwitches={maxTabSwitches}
      deadline={deadline}
      scoreMCQ={scoreMCQ}
      scoreTF={scoreTF}
      scoreSA={scoreSA}
      onFinish={async (resultData) => {
  setExamStarted(false);
  const targetUrl = KETQUA_URL;

  // Hứng điểm an toàn: Kiểm tra cả totalScore và tongdiem để không bị undefined
  const rawScore = resultData.totalScore ?? resultData.tongdiem ?? 0;
  const diemHienThi = String(rawScore).replace('.', ',');

  const payload = {
    action: "submitExam",
    timestamp: new Date().toLocaleString('vi-VN'),   
    exams: String(studentInfo.examCode || "").toUpperCase(),
    sbd: String(studentInfo.sbd || ""),
    name: String(studentInfo.name || ""),
    class: String(studentInfo.className || ""), // Đảm bảo key này khớp với GAS
    tongdiem: diemHienThi, 
    time: resultData.time || 0,
    idgv: String(studentInfo.idgv || ""),
    details: JSON.stringify(resultData.details || [])
  };

  try {
    await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
    alert(`Nộp bài thành công! Điểm của bạn: ${diemHienThi}`);
  } catch (e) {
    console.error("Lỗi:", e);
  }
}}
    />
  </div> // Đóng thẻ div này trước khi đóng dấu ngoặc nhọn
    ) : (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 overflow-x-hidden">
      
     {/* 1. TOP NAV (Style SmartEdu - Đã tích hợp VIP lấp lánh) */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-[100] border-b border-slate-200 px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 mx-auto flex flex-wrap gap-2 justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-100">
               <i className="fas fa-graduation-cap"></i>
            </div>
            <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tighter">Smart<span className="text-blue-600">Edu</span></span>
          </div>

          <div className="flex gap-3 items-center">
             {/* Nếu CHƯA đăng nhập */}
             {!useracc ? (
               <button 
                onClick={() => setAuthMode('login')} 
                className="bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 text-xs sm:text-sm rounded-full text-sm font-black uppercase transition-all"
               >
                 Học sinh đăng nhập
               </button>
             ) : (
               /* Nếu ĐÃ đăng nhập: Hiện số điện thoại và VIP lấp lánh */
               <div className={`relative px-3 py-1.5 text-xs sm:text-sm rounded-full text-sm font-black uppercase transition-all flex items-center gap-2 shadow-sm border ${
                 useracc.vip !== "VIP0" 
                 ? "bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-400 text-red-900 border-yellow-500 animate-pulse shadow-yellow-100 ring-2 ring-yellow-200" 
                 : "bg-slate-100 text-slate-600 border-slate-200"
               }`}>
                 
                 {/* Icon vương miện cho VIP */}
                 {useracc.vip !== "VIP0" && <i className="fas fa-crown text-orange-600 drop-shadow-sm"></i>}
                 
                 <span>{useracc.phoneNumber} <span className="opacity-60">[{useracc.vip}]</span></span>

                 {/* Nút đăng xuất nhanh */}
                 <button 
                   onClick={() => {setUseracc(null); localStorage.removeItem('useracc_session');}}
                   className="ml-1 hover:text-red-500 transition-colors"
                 >
                   <i className="fas fa-power-off"></i>
                 </button>

                 {/* Hiệu ứng Shimmer tia sáng chạy qua cho VIP */}
                {/* Hiệu ứng tia sáng chạy qua nếu là VIP */}
                {useracc.vip !== "VIP0" && (
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
              )}
               </div>
             )}
          </div>
        </div>
      </div>
      {/* 2. MARQUEE (Chữ chạy) */}
      <div className="bg-blue-700 py-2 overflow-hidden">
        <div className="whitespace-nowrap text-white font-bold uppercase text-[12px] sm:text-[14px] tracking-widest animate-marquee inline-block">
          ⭐ Chúc các em ôn tập tốt và luôn làm chủ kiến thức! ⭐ Thầy cô liên hệ: 0988.948.882 để được hướng dẫn tạo Web miễn phí!
        </div>
      </div>

      {/* 3. LAYOUT CHÍNH */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
       {/* CỘT TRÁI: MENU CHỨC NĂNG (NÚT + LABEL) */}
        <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory order-1 lg:order-1">
         <div className="w-full text-[10px] font-black text-slate-400 uppercase ml-2">
     Quản lý và tiện ích
      </div>
          
          {/* NÚT ADMIN QUẢN LÝ */}
<div className="relative mt-2">
  <button 
    onClick={handleAdminLogin}
    className="flex-shrink-0 group flex items-center justify-between w-full py-4 px-4 min-h-[56px] bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all active:scale-95"
  >
    <div className="flex items-center gap-3">
      <div className="bg-indigo-600 w-9 h-9 rounded-lg flex items-center justify-center text-white">
        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-users-cog'}`}></i>
      </div>
      <span className="text-sm font-black text-slate-700 uppercase">Admin quản lý</span>
    </div>
    <span className="text-[8px] font-black px-2 py-1 rounded-md text-white uppercase bg-indigo-600">Hot</span>
  </button>

  {/* DANH SÁCH APP SỔ LÊN */}
  {showAdminMenu && (
  <div className="absolute left-0 bottom-full mb-3 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] p-2 animate-in fade-in slide-in-from-bottom-2">
    <div className="flex justify-between items-center p-2 border-b border-slate-50 mb-1">
      <span className="text-[9px] font-bold text-slate-400 uppercase ml-2">Quản trị viên</span>
      <button onClick={() => setShowAdminMenu(false)} className="text-slate-300 hover:text-red-500">
        <i className="fas fa-times text-xs"></i>
      </button>
    </div>
    
    {adminApps.map((app, idx) => (
      <a 
        key={idx} 
        href={app.link} 
        target="_blank" 
        rel="noreferrer" 
        className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-colors group"
      >
        <i className={`${app.icon} text-indigo-600 w-5 text-center`}></i>
        <span className="text-xs font-black text-slate-700 uppercase group-hover:text-indigo-700">
          {app.name}
        </span>
      </a>
    ))}
  </div>
)}
</div>


          

          <button onClick={() => window.open("https://new-chat-bot-two.vercel.app/", '_blank')} className="flex-shrink-0 snap-start group flex items-center justify-between w-full py-4 px-4 min-h-[56px] bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all active:scale-95 touch-manipulation">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs"><i className="fas fa-robot"></i></div>
              <span className="text-sm font-black text-slate-700 uppercase text-left">Trợ lý học tập AI</span>
            </div>
            <span className="text-[8px] font-black px-2 py-1 rounded-md text-white uppercase bg-indigo-500">AI</span>
          </button>

          <button onClick={() => setShowSubjectModal(true)} className="flex-shrink-0 snap-start group flex items-center justify-between w-full py-4 px-4 min-h-[56px] bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition-all active:scale-95 touch-manipulation">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs"><i className="fas fa-book"></i></div>
              <span className="text-sm font-black text-slate-700 uppercase text-left">Chọn môn học khác</span>
            </div>
            <span className="text-[8px] font-black px-2 py-1 rounded-md text-white uppercase bg-purple-600">New</span>
          </button>

         

          <a 
  href="https://gameshow-beryl.vercel.app/"
  target="_blank" 
  rel="noopener noreferrer"
  className="flex-shrink-0 snap-start group flex items-center justify-between w-full py-4 px-4 min-h-[56px] bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-amber-200 transition-all active:scale-95 touch-manipulation"
>
  <div className="flex items-center gap-3">
    <div className="bg-amber-500 w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs">
      <i className="fas fa-gem"></i>
    </div>
    <span className="text-sm font-black text-slate-700 uppercase text-left">GAME SHOW</span>
  </div>
  <span className="text-[8px] font-black px-2 py-1 rounded-md text-white uppercase bg-amber-500 shadow-sm shadow-amber-200">Vip</span>
</a>

       {/* ỨNG DỤNG KHÁC - CLICK ĐỂ HIỆN LIST */}
          <div className="relative mt-2">
            <button 
              type="button"
              onClick={() => setShowAppList(!showAppList)}
              className="flex items-center justify-between w-full py-4 px-4 min-h-[56px] bg-teal-600 text-white rounded-2xl shadow-lg border-b-4 border-teal-800 transition-all active:scale-95 touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-th-large"></i>
                <span className="text-sm font-black uppercase">Ứng dụng khác</span>
              </div>
              <i className={`fas fa-chevron-${showAppList ? 'down' : 'right'} text-xs opacity-50 transition-transform`}></i>
            </button>

            {/* List hiện lên ngay lập tức từ biến EXTRA_APPS_DATA */}
            {showAppList && (
              <div className="absolute left-0 bottom-full mb-3 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] p-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center p-2 border-b border-slate-50 mb-1">
                   <span className="text-[9px] font-bold text-slate-400 uppercase ml-2">Danh sách ứng dụng</span>
                   <button type="button" onClick={() => setShowAppList(false)} className="text-slate-300 hover:text-red-500">
                     <i className="fas fa-times text-xs"></i>
                   </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                  {EXTRA_APPS_DATA.map((app, idx) => (
                    <a 
                      key={idx} 
                      href={app.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-3 p-3 hover:bg-teal-50 rounded-xl transition-colors group"
                    >
                      <i className={`${app.icon || 'fas fa-link'} text-teal-600 w-5 text-center`}></i>
                      <span className="text-xs font-black text-slate-700 uppercase group-hover:text-teal-700">{app.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div> {/* Đóng cột trái lg:col-span-3 */}

      {/* CỘT GIỮA: CAROUSEL & TIN TỨC */}
<div className="lg:col-span-6 flex flex-col gap-6 order-1 lg:order-2">
  {/* PHẦN CAROUSEL */}
  <div className="relative h-[160px] sm:h-[320px] lg:h-[380px] rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white bg-slate-100">
    {carouselImages.length > 0 ? (
      carouselImages.map((img, idx) => (
        <img 
          key={idx} 
          src={img} 
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === (currentImg % carouselImages.length) ? 'opacity-100' : 'opacity-0'}`} 
          alt="Carousel" 
        />
      ))
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold">
        Đang tải ảnh...
      </div>
    )}
    
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
    <div className="absolute bottom-8 left-8 text-white">
       <div className="bg-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase mb-2 inline-block shadow-lg">Khơi nguồn đam mê</div>
       <h2 className="text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-2xl font-black uppercase leading-tight">Toán học là môn thể dục của trí tuệ!</h2>
    </div>
  </div>

  {/* PHẦN TIN TỨC */}
  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
     <h3 className="text-blue-600 font-black text-xs uppercase mb-4 flex items-center gap-2">
        <i className="fas fa-newspaper"></i> Thông tin & Sự kiện mới
     </h3>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {newsList.length > 0 ? (
          newsList.map((item, i) => (
            <a 
              key={i} 
              href={item.l} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
            >
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover:scale-150 transition-transform"></div>
               <span className="text-[12px] font-bold text-slate-700 truncate">{item.t}</span>
            </a>
          ))
        ) : (
          <div className="text-slate-400 text-xs italic p-2 italic">
            Đang cập nhật tin tức mới nhất...
          </div>
        )}
     </div>
  </div>
</div>       

     {/* CỘT PHẢI: QUIZ & TOP 10 (VUỐT) */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-3">
          {/* CỤM NÚT ĐIỀU KHIỂN */}
          <div className="bg-white p-4 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col gap-3">
            <a
  href="https://thayhabacninh.vercel.app/?mode=quiz"
  target="_blank"
  rel="noopener noreferrer"
  className="w-full bg-orange-500 text-white p-4 rounded-2xl font-black text-xs uppercase shadow-lg border-b-4 border-orange-700 hover:brightness-110 active:scale-95 touch-manipulation transition-all flex items-center justify-center gap-2"
>
  <i className="fas fa-gift animate-bounce"></i>
  SĂN QUÀ QUIZ
</a>
           <div className="grid grid-cols-2 gap-2">
 {[12, 11, 10].map(g => (
<button 
     key={g} 
      onClick={() => onSelectGrade(g)} 
      className="bg-blue-600 text-white p-2.5 rounded-xl font-black text-[10px] uppercase border-b-4 border-blue-800 transition-all active:scale-95 flex items-center justify-center gap-2"
    >
      <i className="fas fa-graduation-cap text-[10px]"></i> 
      <span>Lớp {g}</span>
</button>
))}



{/* Nút Thi đề lẻ - Chốt ngay sau Lớp 12 */}
<button 
  onClick={() => setShowStudentLogin(true)} 
  className="bg-orange-500 text-white p-2.5 min-h-[44px] rounded-xl font-black text-xs uppercase border-b-4 border-emerald-800 transition-all active:scale-95 touch-manipulation flex items-center justify-center gap-2"
>
  <i className="fas fa-user-edit text-xs"></i> 
  <span>Thi đề lẻ</span>
</button>
             {/* Nút xem điểm */}
<button 
  onClick={() => setShowScoreModal(true)}
  className="bg-orange-500 text-white p-2.5 min-h-[44px] rounded-xl font-black text-xs uppercase border-b-4 border-emerald-800 transition-all active:scale-95 touch-manipulation flex items-center justify-center gap-2"
>
  <i className="fas fa-user-edit text-xs"></i> 
  <span>Xem điểm</span>
</button>

{/* Nút Lời giải - Nằm bên dưới */}
<button 
  onClick={() => setShowModal(true)}
  className="bg-orange-500 text-white p-2.5 min-h-[44px] rounded-xl font-black text-xs uppercase border-b-4 border-orange-700 transition-all active:scale-95 touch-manipulation flex items-center justify-center gap-2"
>
  <i className="fas fa-search text-xs"></i> 
  <span>Lời giải</span>
</button>
            <div className="relative w-full">
  
  {/* Nút Reset chính */}
  <button
    onClick={() => {
      if (!idgv) {
        setShowIdgvModal(true);
      } else {
        setShowResetMenu(!showResetMenu);
      }
    }}
    className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 transition w-full"
  >
    🔥 Reset
  </button>

  {/* Menu xổ xuống */}
  {showResetMenu && (
    <div className="absolute left-0 mt-2 w-full bg-slate-900 border border-red-500 rounded-xl shadow-xl z-50 flex flex-col gap-2 p-3">
      {/* X.KQ */}
     <button
      onClick={() => {
      setResetType("ketqua");   // 👈 QUAN TRỌNG
      setShowResetModal(true);
      setShowResetMenu(false);
      }}
      className="bg-red-600 text-white px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-red-700 transition"
      >
  Kết quả
</button>
      {/* 3 nút còn lại */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => {
      setResetType("matran");   // 👈 QUAN TRỌNG
      setShowResetModal(true);
      setShowResetMenu(false);
      }}
          className="bg-red-600 text-white px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-red-700 transition"
        >
          Matrix
        </button>

        <button
          onClick={() => {
      setResetType("exams");   // 👈 QUAN TRỌNG
      setShowResetModal(true);
      setShowResetMenu(false);
      }}
          className="bg-red-600 text-white px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-red-700 transition"
        >
          Exams
        </button>

        <button
          onClick={() => {
      setResetType("exam_data");   // 👈 QUAN TRỌNG
      setShowResetModal(true);
      setShowResetMenu(false);
      }}
          className="bg-red-600 text-white px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-red-700 transition"
        >
          ExamData
        </button>
      </div>

    </div>
  )}
</div>
</div>


            {/* QUẢN TRỊ */}
            <div className="mt-4 pt-6 border-t border-slate-100 flex flex-col gap-3 w-full">
              <button onClick={() => setView('word')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-4 min-h-[56px] rounded-2xl font-black text-xs uppercase shadow-lg border-b-4 border-emerald-800 hover:brightness-110 active:scale-95 touch-manipulation transition-all flex items-center justify-center gap-3 group">
                <i className="fas fa-chalkboard-teacher text-lg"></i>
                <div className="flex flex-col items-start text-left">
                  <span className="leading-none mb-1 text-sm">Tạo đề từ Word</span>
                  <span className="text-[7px] opacity-70 uppercase">Cần xác minh Giáo viên!!</span>
                </div>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setIsMatrixOpen(true)} className="p-3 bg-white border-2 border-emerald-50 rounded-2xl hover:border-emerald-500 transition-all shadow-sm flex flex-col items-center gap-1">
                  <i className="fas fa-th-large text-emerald-600"></i>
                  <span className="text-[8px] font-black uppercase">Tạo Ma Trận Đề</span>
                </button>
                <button onClick={() => setView('cauhoi')} className="p-3 bg-white border-2 border-rose-50 rounded-2xl hover:border-rose-500 transition-all shadow-sm flex flex-col items-center gap-1">
                  <i className="fas fa-database text-rose-600"></i>
                  <span className="text-[8px] font-black uppercase">Ngân Hàng Câu Hỏi</span>
                </button>
              </div>
            </div>
          </div>

          {/* TOP 10 CAO THỦ */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[420px] lg:h-[480px]">
            <div className="bg-slate-900 p-4 text-white font-black text-xs uppercase text-center tracking-widest flex items-center justify-center gap-2 font-black">
              <i className="fas fa-crown text-yellow-400"></i> Bảng Vàng Cao Thủ
            </div>
            <div className="p-2 space-y-2 flex-grow overflow-y-auto no-scrollbar scroll-smooth bg-slate-50/50">
              {stats.top10 && stats.top10.length > 0 ? stats.top10.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-transform active:scale-95 touch-manipulation">
                  <div className={`w-8 text-center text-[12px] sm:text-[14px] font-black ${index < 3 ? 'text-yellow-600' : 'text-slate-300'}`}>{index + 1}</div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-black uppercase truncate text-slate-700">{item.name}</div>
                    <div className="text-[9px] text-slate-400 font-bold italic">{item.idPhone}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-black text-red-600">{item.score} đ</div>
                    <div className="text-[8px] text-slate-400">{item.time}s</div>
                  </div>
                </div>
              )) : <div className="p-10 text-center text-xs font-bold text-slate-300 uppercase">Đang tải...</div>}
            </div>
          </div>
        </div>
      </div>

      {/* --- CÁC MODAL GIỮ NGUYÊN LOGIC CŨ --- */}
     {/* 5. MODALS */}
     {isMatrixOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 font-sans">
    <div className="bg-white w-full max-w-7xl max-h-[98vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
      
      {/* HÀNG 1: THÔNG TIN CƠ BẢN (HEADER) */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-4 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">⚙️ Thiết Lập Ma Trận Đề (Phát triển bởi: Nguyễn Văn Hà - Bắc Ninh - 0988.948.882)</h2>
            <p className="text-blue-200 text-xs">Cấu hình chi tiết chuyên đề và mức độ nhận thức</p>
          </div>
          <button onClick={() => setIsMatrixOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-6">

  {/* Chọn lớp */}
  <div className="space-y-1">
    <label className="text-[10px] uppercase font-bold text-green-300">
      Lớp
    </label>

    <select
      value={selectedGrade}
      onChange={(e)=>setSelectedGrade(e.target.value)}
      className="w-full bg-green-950/30 border border-green-400/40 rounded-lg px-3 py-3 text-sm outline-none focus:border-green-300 transition-all font-semibold"
    >
      <option value="12">Lớp 12</option>
      <option value="11">Lớp 11</option>
      <option value="10">Lớp 10</option>
    </select>
  </div>

  {/* Mã kiểm tra */}
  <div className="space-y-1">
    <label className="text-[10px] uppercase font-bold text-blue-300">
      Mã kiểm tra(exams)
    </label>

    <input
      value={maTranForm.makiemtra}
      onChange={e => setMaTranForm({...maTranForm, makiemtra: e.target.value})}
      className="w-full bg-blue-950/30 border border-blue-400/30 rounded-lg px-3 py-3 text-sm outline-none focus:border-blue-300 transition-all"
      placeholder="Viết liền, KTTX1..."
    />
  </div>

  {/* Tên kỳ thi */}
  <div className="space-y-1">
    <label className="text-[10px] uppercase font-bold text-blue-300">
      Tên bài kiểm tra
    </label>

    <input
      value={maTranForm.name}
      onChange={e => setMaTranForm({...maTranForm, name: e.target.value})}
      className="w-full bg-blue-950/30 border border-blue-400/30 rounded-lg px-3 py-3 text-sm outline-none focus:border-blue-300 transition-all"
      placeholder="Ví dụ: KT Giữa kỳ 1"
    />
  </div>

  {/* Thời gian */}
  <div className="space-y-1">
    <label className="text-[10px] uppercase font-bold text-blue-300">
      Thời gian (phút)
    </label>

    <input
      type="number"
      value={maTranForm.duration}
      onChange={e => setMaTranForm({...maTranForm, duration: e.target.value})}
      className="w-full bg-blue-950/30 border border-blue-400/30 rounded-lg px-3 py-3 text-sm outline-none focus:border-blue-300 transition-all"
      placeholder="90"
    />
  </div>

  {/* ID giáo viên */}
  <div className="space-y-1">
  <label className="text-[10px] uppercase font-bold text-orange-500 tracking-wider">
    Mã số Giáo viên
  </label>

  <input
    type="text"
    value={idgv}
    onChange={(e) => setIdgv(e.target.value)} // Thêm dòng này để cho phép gõ chữ
    placeholder="Nhập mã GV..."
    className="w-full bg-white border-2 border-orange-400 rounded-lg px-3 py-3 text-sm font-bold text-orange-700 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-orange-200"
  />
</div>

</div>

        {/* THANH TỔNG ĐIỂM DỰ KIẾN (TỰ ĐỘNG TÍNH) */}
       <div className="bg-white border-2 border-blue-100 rounded-xl p-3 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-bold">
    
    {/* VẾ TRÁI: TỔNG SỐ CÂU & CHI TIẾT */}
    <div className="flex items-center gap-2 text-gray-700">
      <span className="text-blue-600 uppercase text-[11px] tracking-wider">Tổng số câu:</span>
      <span className="text-xl font-black text-blue-700">
        {selectedTopics.reduce((sum, t) => sum + (parseInt(t.numMC) || 0) + (parseInt(t.numTF) || 0) + (parseInt(t.numSA) || 0), 0)}
      </span>
      
      <div className="ml-2 px-3 py-1 bg-gray-100 rounded-full text-[12px] text-gray-500 font-semibold border-2 border-blue-500">
        {(() => {
          const tMC = selectedTopics.reduce((sum, t) => sum + (parseInt(t.numMC) || 0), 0);
          const tTF = selectedTopics.reduce((sum, t) => sum + (parseInt(t.numTF) || 0), 0);
          const tSA = selectedTopics.reduce((sum, t) => sum + (parseInt(t.numSA) || 0), 0);
          return `MCQ: ${tMC} ; TF: ${tTF} ; SA: ${tSA}`;
        })()}
      </div>
    </div>

    {/* VẠCH PHÂN CÁCH DỌC */}
    <div className="hidden md:block h-6 w-[2px] bg-gray-200"></div>

    {/* VẾ PHẢI: TỔNG ĐIỂM */}
    <div className="flex items-center gap-2">
      <span className="text-blue-600 uppercase text-[11px] tracking-wider">Tổng điểm dự kiến:</span>
      {(() => {
        const sMC = parseFloat(maTranForm.scoreMC) || 0;
        const sTF = parseFloat(maTranForm.scoreTF) || 0;
        const sSA = parseFloat(maTranForm.scoreSA) || 0;
        const tMC = selectedTopics.reduce((sum, t) => sum + (parseInt(t.numMC) || 0), 0);
        const tTF = selectedTopics.reduce((sum, t) => sum + (parseInt(t.numTF) || 0), 0);
        const tSA = selectedTopics.reduce((sum, t) => sum + (parseInt(t.numSA) || 0), 0);
        const total = (tMC * sMC) + (tTF * sTF) + (tSA * sSA);
        return (
          <span className={`text-xl font-black ${Math.abs(total - 10) < 0.01 ? 'text-green-600' : 'text-orange-600'}`}>
            {total.toFixed(2)}
          </span>
        );
      })()}
    </div>

  </div>
</div>
      </div>

      {/* HÀNG 2: BẢNG CHUYÊN ĐỀ (BODY) */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50 custom-scrollbar">
        <div className="min-w-[950px]">
          {/* Header Bảng */}
          <div className="grid grid-cols-[2.5fr_repeat(9,1fr)] gap-2 mb-3 text-center font-bold text-[10px] uppercase tracking-wider">
            <div className="text-left px-2 text-gray-400">Chuyên đề</div>
            <div className="col-span-3 py-1 bg-blue-600 text-white rounded-t-lg">Phần I (Trắc nghiệm)</div>
            <div className="col-span-3 py-1 bg-emerald-600 text-white rounded-t-lg">Phần II (Đúng/Sai)</div>
            <div className="col-span-3 py-1 bg-amber-600 text-white rounded-t-lg">Phần III (Trả lời ngắn)</div>
          </div>

          <div className="grid grid-cols-[2.5fr_repeat(9,1fr)] gap-2 mb-2 text-center text-[10px] font-bold text-gray-500 bg-white py-1 shadow-sm border rounded-lg">
            <div className="text-left px-3">Chọn chuyên đề</div>
            <div className="text-blue-600">Số câu</div><div className="text-blue-600">L3</div><div className="text-blue-600">L4</div>
            <div className="text-emerald-600">Số câu</div><div className="text-emerald-600">L3</div><div className="text-emerald-600">L4</div>
            <div className="text-amber-600">Số câu</div><div className="text-amber-600">L3</div><div className="text-amber-600">L4</div>
          </div>

          {/* Danh sách các dòng chuyên đề */}
          <div className="space-y-2 pb-4">
            {selectedTopics.map((topic, idx) => (
              <div key={idx} className="grid grid-cols-[2.5fr_repeat(9,1fr)] gap-2 items-center bg-white p-2 rounded-xl border-2 border-blue-500 shadow-sm hover:border-blue-400 transition-all group">
                {/* SỔ CHỌN CHUYÊN ĐỀ DÙNG matrixTopics MỚI */}
                {console.log("Danh sách topics hiện có trong Modal:", matrixTopics)}
               <select
  value={topic.idcd}
  onChange={(e) => updateTopicRow(idx, 'idcd', e.target.value)}
  className="w-full p-2 border-2 border-blue-500 rounded-lg text-xs font-semibold bg-white"
>
  <option value="">-- Chọn chuyên đề --</option>

  {filteredTopics.map((t) => (
    <option key={t.id} value={t.id}>
      Lớp {t.grade} — {t.name}
    </option>
  ))}

</select>

                {/* Ô nhập liệu tự động */}
                {[ 'numMC', 'mcL3', 'mcL4', 'numTF', 'tfL3', 'tfL4', 'numSA', 'saL3', 'saL4' ].map((field) => (
                  <input 
                    key={field}
                    type="number" 
                    value={topic[field] || ''} 
                    onChange={e => updateTopicRow(idx, field, e.target.value)} 
                    className={`w-full p-2 border rounded-lg text-center text-[11px] outline-none focus:ring-2 transition-all ${
                      field.includes('MC') ? 'focus:ring-blue-500 border-blue-500' : 
                      field.includes('TF') ? 'focus:ring-emerald-500 border-blue-500' : 'focus:ring-amber-500 border-blue-500'
                    }`}
                  />
                ))}
              </div>
            ))}

            <div className="mt-4 flex items-center justify-between">
              <button 
                onClick={() => setSelectedTopics([...selectedTopics, { idcd: '', numMC: '', mcL3: '', mcL4: '', numTF: '', tfL3: '', tfL4: '', numSA: '', saL3: '', saL4: '' }])}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-dashed border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-400 font-bold text-sm transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                THÊM CHUYÊN ĐỀ
              </button>
              <p className="text-[11px] text-gray-400 italic px-2 bg-gray-100 rounded-full py-1">
                * Lưu ý: Chuyên đề để trống sẽ tự bị loại bỏ khi lưu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HÀNG 3: CẤU HÌNH ĐIỂM & NÚT LƯU (FOOTER) */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Nhập điểm Phần I */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-500 shadow-sm">
            <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-black text-xs">P.I</span>
            <div className="flex-1 text-left">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Điểm/Câu</label>
              <input value={maTranForm.scoreMC} onChange={e => setMaTranForm({...maTranForm, scoreMC: e.target.value})} className="w-full font-bold text-blue-700 outline-none text-sm" placeholder="0.25"/>
            </div>
          </div>
          {/* Nhập điểm Phần II */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-500 shadow-sm">
            <span className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-lg font-black text-xs">P.II</span>
            <div className="flex-1 text-left">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Điểm/Câu</label>
              <input value={maTranForm.scoreTF} onChange={e => setMaTranForm({...maTranForm, scoreTF: e.target.value})} className="w-full font-bold text-emerald-700 outline-none text-sm" placeholder="1.0"/>
            </div>
          </div>
          {/* Nhập điểm Phần III */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-500 shadow-sm">
            <span className="w-10 h-10 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg font-black text-xs">P.III</span>
            <div className="flex-1 text-left">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Điểm/Câu</label>
              <input value={maTranForm.scoreSA} onChange={e => setMaTranForm({...maTranForm, scoreSA: e.target.value})} className="w-full font-bold text-amber-700 outline-none text-sm" placeholder="0.5"/>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setIsMatrixOpen(false)} className="flex-1 py-3 px-6 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all">Hủy bỏ</button>
          <button 
            onClick={handleSaveMatrix}
            disabled={loadingMatrix}
            className={`flex-[2] py-3.5 px-6 rounded-xl font-extrabold text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
              loadingMatrix ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-700 to-indigo-800 hover:scale-[1.01]'
            }`}
          >
            {loadingMatrix ? 'ĐANG LƯU...' : 'XÁC NHẬN LƯU MA TRẬN'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
           
      {/* MODAL VIP OPTIONS */}
      {showVipOptions && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase">Em muốn thực hiện gì?</h3>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { setShowVipBenefits(true); setShowVipOptions(false); }}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black border-b-4 border-blue-700 active:translate-y-1 transition-all uppercase"
              >
                <i className="fas fa-list-check mr-2"></i> Xem Quyền lợi VIP
              </button>

              <a 
                href="https://forms.gle/co6FiWndaaLjtFNR8" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black border-b-4 border-orange-700 active:translate-y-1 transition-all uppercase block"
              >
                <i className="fas fa-paper-plane mr-2"></i> Đăng ký VIP ngay
              </a>
            </div>

            <button onClick={() => setShowVipOptions(false)} className="mt-6 text-slate-400 font-bold hover:text-red-500 transition">Đóng</button>
          </div>
        </div>
      )}

      {/* MODAL VIP BENEFITS */}
      {showVipBenefits && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-2xl font-black text-orange-600 mb-4 uppercase text-center italic">Đặc quyền VIP</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 font-bold text-slate-700">
                <i className="fas fa-check-circle text-green-500 text-xl"></i> Mở khóa toàn bộ kho đề thi 10, 11, 12.
              </li>
              <li className="flex items-center gap-3 font-bold text-slate-700">
                <i className="fas fa-check-circle text-green-500 text-xl"></i> Xem lời giải chi tiết (Video + File PDF).
              </li>
              <li className="flex items-center gap-3 font-bold text-slate-700">
                <i className="fas fa-check-circle text-green-500 text-xl"></i> Không giới hạn lượt làm Quiz mỗi ngày.
              </li>
              <li className="flex items-center gap-3 font-bold text-slate-700">
                <i className="fas fa-check-circle text-green-500 text-xl"></i> Hỗ trợ trực tiếp từ Thầy qua Zalo VIP.
              </li>
            </ul>
            <button 
  onClick={() => { 
    setShowVipBenefits(false); // Đóng bảng đặc quyền
    window.open("https://forms.gle/co6FiWndaaLjtFNR8", "_blank"); // Mở ngay link đăng ký
  }}
  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-black uppercase shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
>
  ĐÃ HIỂU - ĐĂNG KÝ VIP NGAY <i className="fas fa-paper-plane"></i>
</button>
          </div>
        </div>
      )}
      {/* MODAL LỊCH HỌC */}
      {showLichOptions && (
  /* 1. BACKDROP: Click ra vùng đen để đóng */
  <div 
    className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
    onClick={() => setShowLichOptions(false)} 
  >
    {/* 2. MODAL CONTENT: Chặn sự kiện click để không bị đóng khi bấm vào nội dung */}
    <div 
      className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300 border-4 border-white relative"
      onClick={(e) => e.stopPropagation()} 
    >
      
      {/* --- NÚT ĐÓNG (X) HOẠT ĐỘNG --- */}
      <button 
        onClick={() => setShowLichOptions(false)}
        className="absolute top-5 right-5 z-50 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm shadow-sm cursor-pointer active:scale-95 touch-manipulation"
        aria-label="Đóng lịch học"
      >
        <i className="fas fa-times text-xl"></i>
      </button>
      {/* ------------------------------- */}

      {/* Header Modal */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center text-white relative h-40 flex flex-col justify-center items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 text-6xl font-black pointer-events-none uppercase">
          Calendar
        </div>
        <i className="fas fa-calendar-alt text-4xl mb-2 relative z-10"></i>
        <h3 className="text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-2xl font-black uppercase tracking-tighter relative z-10">
          Lịch Học Offline
        </h3>
        <p className="text-orange-100 font-bold relative z-10 text-xs">Cập nhật mới nhất! Liên hệ thầy Hà để tham gia lớp học nhé</p>
        
      </div>

      {/* Body List (Giữ nguyên logic của bạn) */}
      <div className="p-6 bg-slate-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div className="grid gap-3">
          {schedules && schedules.length > 0 ? (
            schedules.map((item, idx) => {
              const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-red-500', 'bg-emerald-500'];
              const colorClass = colors[idx % colors.length];
              
              return (
                <div key={idx} className="flex items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform">
                  <div className={`${colorClass} w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg`}>
                    {item.grade.replace(/\D/g, '') || "!"}
                  </div>
                  <div className="ml-4">
                    <div className="text-slate-400 text-xs font-black uppercase tracking-widest">{item.grade}</div>
                    <div className="text-slate-800 font-black text-lg leading-tight">{item.time}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-400 font-bold italic">
              Đang tải lịch học mới nhất...
            </div>
          )}
        </div>      
      </div>
          {/* Nút đóng */} 
      <div className="p-6 bg-white border-t border-slate-100">
        <button 
          onClick={() => setshowLichOptions(false)}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg active:scale-95 touch-manipulation transition-all"
        >
          Đóng lịch học
        </button>
      </div>
    </div>
  </div>
)} 
      {/* Chọn môn */}
     {showSubjectModal && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-black text-indigo-700 uppercase text-center mb-6 italic">Hệ thống học liệu đa năng</h3>
      
      <div className="grid grid-cols-2 gap-4 overflow-hidden">
        {/* CỘT MÔN HỌC */}
        <div className="flex flex-col overflow-hidden">
          <div className="bg-indigo-50 p-2 font-black text-indigo-600 text-center uppercase text-sm rounded-t-xl">Môn học</div>
          <div className="overflow-y-auto space-y-1 mt-2 pr-2 no-scrollbar bg-slate-50/50 p-1 rounded-b-xl">
            {dynamicSubjects.map(sub => (
              <button key={sub} onClick={() => setSelectedSubject(sub)} className={`w-full flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all ${selectedSubject === sub ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedSubject === sub ? 'bg-white text-indigo-600' : 'bg-slate-100'}`}>
                  {selectedSubject === sub && <i className="fas fa-check text-[8px]"></i>}
                </div> {sub}
              </button>
            ))}
          </div>
        </div>

        {/* CỘT CẤP HỌC */}
        <div className="flex flex-col overflow-hidden">
          <div className="bg-orange-50 p-2 font-black text-orange-600 text-center uppercase text-sm rounded-t-xl">Cấp học</div>
          <div className="overflow-y-auto space-y-1 mt-2 pr-2 no-scrollbar bg-slate-50/50 p-1 rounded-b-xl">
            {dynamicLevels.map(lvl => (
              <button key={lvl} onClick={() => setSelectedLevel(lvl)} className={`w-full flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all ${selectedLevel === lvl ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white border-slate-100 hover:border-orange-200'}`}>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedLevel === lvl ? 'bg-white text-orange-600' : 'bg-slate-100'}`}>
                  {selectedLevel === lvl && <i className="fas fa-check text-[8px]"></i>}
                </div> {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => setShowSubjectModal(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase text-xs text-slate-400">Đóng</button>
        <button 
          onClick={handleRedirect} 
          disabled={!selectedSubject || !selectedLevel} 
          className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs transition-all ${selectedSubject && selectedLevel ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg active:scale-95 touch-manipulation' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          Truy cập ngay <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  </div>
)}
        
  {/* 6.MODAL QUIZ (Sửa lỗi step-by-step) */}
      {showQuizModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 overflow-y-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-2xl font-black text-orange-500 mb-6 uppercase text-center">
              {quizMode === 'gift' ? '🎁 Chế độ Quà QuiZ' : quizMode === 'free' ? '🎮 QuiZ Tự Do' : '🚀 Chọn chế độ chơi'}
            </h2>

            {!quizMode ? (
              <div className="flex flex-col gap-4">
                <button onClick={() => setQuizMode('free')} className="py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-lg">
                  <i className="fas fa-gamepad text-xl"></i> Chơi Tự Do
                </button>
                <button onClick={() => setQuizMode('gift')} className="py-4 bg-orange-500 text-white rounded-2xl font-bold uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-orange-200">
                  <i className="fas fa-gift text-xl"></i> Săn Quà QuiZ
                </button>
                <button onClick={() => setShowQuizModal(null)} className="mt-2 text-slate-400 text-sm font-bold">Để sau</button>
              </div>
            ) : (
              <form onSubmit={handleStartQuiz} className="space-y-4 animate-fade-in">
                {quizMode === 'gift' && (
                  <input required type="password" placeholder="Nhập mật khẩu Admin cấp " className="w-full p-4 bg-red-50 border-2 border-red-100 rounded-xl font-bold text-center" value={inputPassword} onChange={e => setInputPassword(e.target.value)} />
                )}
                {/* 1. Nhập Họ tên */}
                <input required placeholder="Họ và tên học sinh" 
                className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={quizInfo.name} onChange={e=>setQuizInfo({...quizInfo, name: e.target.value})} />

                {/* 2. Nhập Số điện thoại */}
                <input required type="tel" placeholder="Số điện thoại" 
                className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={quizInfo.phone} onChange={e=>setQuizInfo({...quizInfo, phone: e.target.value})} />

               {/* 3. Chọn Lớp */}
          <div className="space-y-2">
            <select required className="w-full p-3 bg-slate-100 rounded-xl font-bold" 
              onChange={(e) => {
                const val = e.target.value;
                setIsOtherClass(val === "Lớp khác");
                setQuizInfo({...quizInfo, class: val === "Lớp khác" ? "" : val});
              }}>
              <option value="">-- Chọn lớp học --</option>
              {(ADMIN_CONFIG.CLASS_ID || []).filter(c => c !== "Lớp khác").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="Lớp khác">Lớp khác (Tự nhập...)</option>
            </select>
            {isOtherClass && (
              <input required placeholder="Nhập tên lớp của em..." 
                className="w-full p-3 bg-orange-50 border border-orange-200 rounded-xl font-bold"
                value={quizInfo.class} onChange={e => setQuizInfo({...quizInfo, class: e.target.value})} 
              />
            )}
          </div>
{/*  Chọn Trường học (Đoạn gốc của thầy) */}
<select required className="w-full p-3 bg-slate-100 rounded-xl font-bold" onChange={(e) => {
  const val = e.target.value;
  setIsOtherSchool(val === "Trường khác");
  setQuizInfo({...quizInfo, school: val === "Trường khác" ? "" : val});
}}>
  <option value="">-- Chọn trường học --</option>
  {ADMIN_CONFIG.schools.map(s => <option key={s} value={s}>{s}</option>)}
  <option value="Trường khác"></option>
</select>

{/* Thêm ô nhập tay cho Trường học */}
{isOtherSchool && (
  <input required placeholder="Nhập tên trường của em..." className="w-full p-3 bg-orange-50 border border-orange-200 rounded-xl font-bold animate-in fade-in slide-in-from-top-1" value={quizInfo.school} onChange={e => setQuizInfo({...quizInfo, school: e.target.value})} />
)}

                {quizMode === 'gift' && (
                  <div className="p-4 bg-orange-50 rounded-2xl space-y-3 border border-orange-100">
                    <p className="text-xs font-black text-orange-400 uppercase text-center">Thông tin nhận thưởng</p>
                    <input required placeholder="Số tài khoản ngân hàng" className="w-full p-3 bg-white rounded-xl font-bold" value={bankInfo.stk} onChange={e=>setBankInfo({...bankInfo, stk: e.target.value})} />
                   <select required className="w-full p-3 bg-white rounded-xl font-bold" onChange={(e) => {
  const val = e.target.value;
  setIsOtherBank(val === "Ngân hàng khác");
  setBankInfo({...bankInfo, bankName: val === "Ngân hàng khác" ? "" : val});
}}>
  <option value="">-- Ngân hàng --</option>
  {ADMIN_CONFIG.banks.map(b => <option key={b} value={b}>{b}</option>)}
  <option value="Ngân hàng khác"></option>
</select>

{/* Thêm ô nhập tay cho Ngân hàng */}
{isOtherBank && (
  <input required placeholder="Nhập tên ngân hàng (Ví dụ: Agribank...)" className="w-full p-3 bg-white border border-orange-200 rounded-xl font-bold animate-in fade-in slide-in-from-top-1" value={bankInfo.bankName} onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})} />
)}
                  </div>
                )}
                <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-xl uppercase tracking-widest mt-4">Vào Thi Ngay</button>
                <button type="button" onClick={() => setQuizMode(null)} className="w-full text-slate-400 text-xs font-bold uppercase">Quay lại chọn chế độ</button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* MODAL ĐĂNG KÝ / ĐĂNG NHẬP (MỚI THÊM) */}
      {authMode && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border-4 border-blue-50 relative animate-in zoom-in duration-300">
            <h2 className="text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-2xl font-black text-center uppercase mb-6 text-slate-800 tracking-tighter">
              {authMode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase ml-2 text-slate-400">Số điện thoại</label>
                <input required type="tel" placeholder="0988..." 
                  className="w-full p-4 bg-slate-100 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none transition-all" 
                  value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase ml-2 text-slate-400">Mật khẩu</label>
                <input required type="password" placeholder="••••••" 
                  className="w-full p-4 bg-slate-100 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none transition-all" 
                  value={authForm.pass} onChange={e => setAuthForm({...authForm, pass: e.target.value})} />
              </div>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase shadow-lg border-b-4 border-blue-800 active:scale-95 touch-manipulation transition-all mt-2">
                {authMode === 'login' ? 'Vào hệ thống' : 'Đăng ký ngay'}
              </button>
            </form>
            
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
              className="w-full mt-4 text-xs font-bold text-blue-500 uppercase hover:underline"
            >
              {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký tại đây' : 'Đã có tài khoản? Đăng nhập'}
            </button>
            <button onClick={() => setAuthMode(null)} className="w-full mt-4 text-slate-400 text-xs font-bold uppercase">Bỏ qua</button>
          </div>
        </div>
      )}
      {/* GIAO DIỆN BẢNG TÌM LỜI GIẢI */}
        {showModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[999] p-4">
    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
      
      {/* Header Cam Rực Rỡ */}
      <div className="bg-orange-500 p-8 text-white flex justify-between items-center border-b-8 border-orange-600">
        <h3 className="text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-2xl font-black uppercase tracking-widest flex items-center gap-3">
          <i className="fa-solid fa-lightbulb text-3xl"></i> Lời giải chi tiết
        </h3>
        <button onClick={() => {setShowModal(false); setFoundLG(null); setSearchId("");}} className="hover:rotate-90 transition-all bg-white/20 p-2 rounded-full">
          <i className="fa-solid fa-xmark text-3xl"></i>
        </button>
      </div>

      <div className="p-8 md:p-12">
        {/* Ô nhập ID */}
        <div className="flex gap-4 mb-10">
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchLG()}
            placeholder="Nhập mã ID (VD: 12260128001)..."
            className="flex-1 border-4 border-slate-100 rounded-3xl px-8 py-5 focus:border-orange-500 outline-none font-black text-2xl text-slate-700 shadow-inner"
          />
          <button 
            onClick={handleSearchLG} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 rounded-3xl font-black text-xl shadow-lg transition-all active:scale-95 touch-manipulation"
          >
            {loadingLG ? <i className="fa-solid fa-spinner animate-spin"></i> : "TÌM KIẾM"}
          </button>
        </div>

        {/* Vùng hiển thị Lời giải thuần túy */}
        {foundLG ? (
          <div className="bg-orange-50/50 p-10 rounded-[2.5rem] border-2 border-orange-100 min-h-[350px] max-h-[60vh] overflow-y-auto">
            <div id="modal-lg-content" className="text-2xl leading-relaxed text-slate-800 font-medium">
               <p className="whitespace-pre-wrap italic">
                  {foundLG}
               </p>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-200">
            <i className="fa-solid fa-face-smile text-8xl mb-4 opacity-10"></i>
            <p className="text-xl font-bold italic">Mời thầy nhập mã ID để xem hướng dẫn giải!</p>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 text-center">
         <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Hỗ trợ MathJax & Render sạch nội dung</p>
      </div>
    </div>
  </div>
)}
     {/* 4. MODAL ĐĂNG NHẬP THI LẺ */}
        {showStudentLogin && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white w-full max-w-[450px] rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                <h2 className="text-xl font-black text-slate-800 mb-6 text-center uppercase tracking-tight">
                  Hệ thống thi lẻ
                </h2>

              
              <div className="space-y-3">
                <input 
                  className="w-full p-4 rounded-xl bg-slate-800 text-white border border-slate-700 font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="MÃ GIÁO VIÊN (IDGV)..." 
                  value={studentInfo.idgv} 
                  onChange={e => setStudentInfo({...studentInfo, idgv: e.target.value})} 
                />
                
                <input 
                  className="w-full p-4 rounded-xl bg-slate-800 text-white border border-slate-700 font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="SỐ BÁO DANH (SBD)..." 
                  value={studentInfo.sbd} 
                  onChange={e => setStudentInfo({...studentInfo, sbd: e.target.value})} 
                />
                
                <input 
                  className="w-full p-4 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 font-black text-xs focus:ring-2 focus:ring-emerald-500 outline-none uppercase" 
                  placeholder="MÃ ĐỀ THI (EXAMS)..." 
                  value={studentInfo.examCode} 
                  onChange={e => setStudentInfo({...studentInfo, examCode: e.target.value.toUpperCase()})} 
                />
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button onClick={() => setShowStudentLogin(false)} className="py-3 bg-slate-800 text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors">HỦY</button>
                  <button onClick={handleStudentSubmit} className="py-3 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 transition-all active:scale-95 touch-manipulation">VÀO THI</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
      {showScoreModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    
    <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl relative animate-fadeIn">

      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
        🎯 Tra cứu điểm
      </h2>

      {!scoreData ? (
        <>
          <input
            placeholder="ID Giáo viên"
            className="w-full border border-slate-300 px-4 py-3 mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setIdgv(e.target.value)}
          />

          <input
            placeholder="SBD"
            className="w-full border border-slate-300 px-4 py-3 mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSbd(e.target.value)}
          />

          <input
            placeholder="Mã đề"
            className="w-full border border-slate-300 px-4 py-3 mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setExams(e.target.value)}
          />

          <div className="space-y-3">
            <button
              onClick={handleViewScore}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
            >
              Tra cứu
            </button>

            <button
              onClick={() => setShowScoreModal(false)}
              className="w-full border border-slate-300 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              ← Quay lại
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-slate-50 p-6 rounded-xl space-y-2 text-slate-800 shadow-inner">
            <p><span className="font-semibold">Mã giáo viên:</span> {scoreData.idgv}</p>
            <p><span className="font-semibold">Họ tên:</span> {scoreData.name}</p>
            <p><span className="font-semibold">Lớp:</span> {scoreData.class}</p>
            <p><span className="font-semibold">SBD:</span> {scoreData.sbd}</p>
            <p><span className="font-semibold">Mã đề:</span> {scoreData.exams}</p>
            <p className="text-lg font-bold text-emerald-600">
              Tổng điểm: {scoreData.tongdiem}
            </p>
            <p><span className="font-semibold">Thời gian nộp:</span> {scoreData.time}</p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setScoreData(null)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Tra cứu lại
            </button>

            <button
              onClick={() => {
                setScoreData(null);
                setShowScoreModal(false);
              }}
              className="w-full border border-slate-300 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              ← Quay lại trang chủ
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}
{showResetModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white w-[420px] p-6 rounded-2xl shadow-xl">

      <h2 className="text-xl font-bold mb-4 text-center">
        Reset dữ liệu: {resetType.toUpperCase()}
      </h2>

      {/* IDGV - nếu đã lưu thì disable */}
      <div className="space-y-1 mb-3">
  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ID Giáo viên</label>
  <input
    placeholder="ID Giáo viên"
    className="w-full border-2 p-3 rounded-xl bg-slate-50 font-mono text-blue-600 focus:border-blue-500 outline-none"
    value={idgv}
    onChange={(e) => setIdgv(e.target.value)} // Cho phép sửa trực tiếp tại đây
  />
</div>

      <input
        type="password"
        placeholder="Mật khẩu"
        className="w-full border p-2 mb-3 rounded-lg"
        value={resetPassword}
        onChange={(e) => setResetPassword(e.target.value)}
      />

      <select
        className="w-full border p-2 mb-3 rounded-lg"
        value={resetMode}
        onChange={(e) => setResetMode(e.target.value)}
      >
        <option value="all">Xóa ALL</option>
        <option value="byExams">Xóa theo mã exams</option>
      </select>

      {resetMode === "byExams" && (
        <select
          className="w-full border p-2 mb-3 rounded-lg"
          value={resetExams}
          onChange={(e) => setResetExams(e.target.value)}
        >
          <option value="">-- Chọn mã exams --</option>

          {examsList.length === 0 && (
            <option disabled>Không có dữ liệu</option>
          )}

          {examsList.map((exam) => (
            <option key={exam} value={exam}>
              {exam}
            </option>
          ))}
        </select>
      )}

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setShowResetModal(false)}
          className="bg-blue-500 text-white px-3 py-1.5 text-xs sm:text-sm rounded-lg"
        >
          Quay lại
        </button>

        <button
          onClick={handleReset}
          className="bg-red-600 text-white px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-red-700"
        >
          Xóa dữ liệu
        </button>
      </div>

    </div>
  </div>
)}
      
      {showIdgvModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-sm space-y-4 border border-slate-700">
      <h2 className="text-white font-bold text-lg flex items-center gap-2">
        🔐 {idgv ? "Đổi ID Giáo viên" : "Nhập IDGV"}
      </h2>

      <input
        type="text"
        placeholder="Nhập IDGV mới..."
        defaultValue={idgv} // Dùng defaultValue để hiện giá trị cũ nhưng vẫn cho sửa
        id="temp_idgv_input" // Đặt ID để lấy value thủ công
        className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600 focus:ring-2 ring-blue-500 outline-none"
      />

      <div className="flex gap-2">
        <button
          onClick={() => setShowIdgvModal(false)}
          className="flex-1 bg-slate-700 py-3 rounded-xl text-white font-bold"
        >
          Hủy
        </button>
        <button
          onClick={() => {
            const newVal = document.getElementById('temp_idgv_input').value.trim();
            if (!newVal) return alert("Vui lòng nhập ID!");
            
            // Lưu chính thức vào State và LocalStorage
            setIdgv(newVal);
            localStorage.setItem('idgv', btoa(newVal));
            
            setShowIdgvModal(false);
            setShowResetMenu(true);
            alert("✅ Đã cập nhật IDGV: " + newVal);
          }}
          className="flex-1 bg-blue-600 py-3 rounded-xl text-white font-bold hover:bg-blue-700"
        >
          Xác nhận
        </button>
      </div>
    </div>
  </div>
)}
      {idgv && (
  <button
    onClick={() => setShowIdgvModal(true)}
    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 transition-colors mt-3 mx-auto"
  >
    <i className="fa-solid fa-arrows-rotate"></i>
    Đổi IDGV hiện tại ({idgv})
  </button>
)}
      {showNotice && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md text-center">

      <h2 className="text-xl font-bold text-green-600 mb-3">
        🎉 Chúc mừng {studentName}
      </h2>

      <p className="text-blue-600 font-semibold mb-2">
        🔁 Bạn có {maxthi} lần làm bài
      </p>

      <p className="text-purple-600 font-semibold mb-2">
        ⏱ Thời gian làm bài: {duration} phút
      </p>
       <p className="text-purple-600 font-semibold mb-2">
        ⏱ Thời gian tối thiểu: {minSubmitTime} phút
      </p>
      <p className="text-indigo-600 font-semibold mb-3">
        📄 Số câu hỏi: {questions.length}
      </p>

      <p className="text-red-500 text-sm mb-4">
        ⚠️ Đọc kỹ: • Tuyệt đối không nộp bài sớm • F5 sẽ tự nộp bài • Không thoát Fullscreen • Không chuyển Tab • Không chụp màn hình • Không chuột phải • Không mở 2 tab cùng thi...
      </p>

      <div className="text-lg font-bold text-gray-700 mb-3">
        Bài thi sẽ tự động bắt đầu sau {countdown}s
      </div>

      <button
        onClick={() => setShowNotice(false)}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
      >
        Vào thi ngay
      </button>

    </div>

  </div>
)}


    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

    <style>{`
      @keyframes marquee { 
        0% { transform: translateX(100%); } 
        100% { transform: translateX(-100%); } 
      }
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
      .animate-marquee { 
        display: inline-block; 
        animation: marquee 25s linear infinite; 
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  </>
  );
}

export default LandingPage;
