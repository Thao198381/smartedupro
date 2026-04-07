import React, { useState, useEffect } from 'react';
import QuestionPreviewBlock from './QuestionPreviewBlock'; // Đảm bảo đúng đường dẫn
import { DANHGIA_URL, KETQUA_URL } from '../config';
const EditableSection = ({ title, value, onSave, icon, isSmall }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => { setTempValue(value); }, [value]);

  // Ép MathJax quét lại sau khi render hoặc sửa xong
 useEffect(() => {
  if (!isEditing && window.MathJax?.typesetPromise) {
    const el = document.querySelector('.mathjax-content');
    if (el) {
      window.MathJax.typesetPromise([el]);
    }
  }
}, [isEditing, value]);

  const handleSave = () => {
  onSave(tempValue);
  setIsEditing(false);
};
  // --- HÀM XỬ LÝ NỘI DUNG TỔNG LỰC ---
  const getHtmlContent = () => {
  if (!value) return '<span class="opacity-30 italic">Trống...</span>';
  let content = String(value);

  // 1. Tự động hiển thị ảnh nếu nội dung là link ảnh
  const imgRegex = /(https?:\/\/[^\s]+?\.(png|jpg|jpeg|gif|webp))/gi;
  if (!content.includes('<img') && imgRegex.test(content)) {
    content = content.replace(imgRegex, '<img src="$1" class="max-w-full h-auto rounded-lg my-2 shadow-sm" />');
  }

  // 2. Hiển thị ĐÁP ÁN ĐÚNG dạng Badge gọn gàng (Đã xóa chữ ĐÁP ÁN/KẾT QUẢ thừa)
  if (title.toLowerCase().includes("đáp án")) {
    return `
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl shadow-sm font-bold">
        <i class="fa-solid fa-check-circle text-[10px] opacity-50"></i>
        <span>${content}</span>
      </div>
    `;
  }

  // 3. XỬ LÝ PHẦN PHƯƠNG ÁN (JSON)
  const isOptions = title.toLowerCase().includes("phương án") || title.toLowerCase().includes("options");
  if (isOptions) {
    try {
      const data = typeof value === 'string' ? JSON.parse(value) : value;

      // Câu Đúng/Sai (Mảng Object)
      if (Array.isArray(data) && typeof data[0] === 'object') {
        return data.map((item, idx) => `
          <div class="p-2 mb-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
            <span class="font-bold text-blue-600">Ý ${idx + 1}: </span>
            <span class="mathjax-item">${item.text}</span> 
            <span class="ml-2 font-black ${item.a ? 'text-emerald-600' : 'text-rose-500'}">
              (${item.a ? 'Đúng' : 'Sai'})
            </span>
          </div>
        `).join('');
      }
      
      // Câu MCQ (Mảng chuỗi)
      if (Array.isArray(data)) {
        const labels = ['A', 'B', 'C', 'D'];
        return `<div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
          ${data.map((text, i) => `
            <div class="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <b class="text-blue-500">${labels[i] || i}:</b> ${text}
            </div>
          `).join('')}
        </div>`;
      }
    } catch (e) { return content; }
  }

  return content;
};
  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-50 transition-all hover:shadow-md mb-4 group">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
          <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
            <i className={`fa-solid ${icon} text-[10px]`}></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider">{title}</span>
        </div>
        
        {/* Nút Sửa: Làm nhỏ lại cho tinh tế */}
       {!isEditing && (
  <button
    onClick={() => setIsEditing(true)}
    className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg font-bold text-[9px] hover:bg-blue-600 hover:text-white transition-all"
  >
    CHỈNH SỬA
  </button>
)}
        {isEditing && (
          <div className="flex gap-1">
             <button onClick={handleSave} className="px-3 py-1 bg-emerald-500 text-white rounded-lg font-bold text-[9px]">LƯU</button>
             <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg font-bold text-[9px]">HỦY</button>
          </div>
        )}
      </div>

      <div className="mathjax-content">
        {isEditing ? (
         <textarea
  className={`w-full p-4 md:p-5 bg-slate-50 rounded-2xl text-sm md:text-base outline-none border-2 border-blue-200 text-sm font-medium transition-all focus:bg-white resize-y ${isSmall ? 'min-h-[120px]' : 'min-h-[260px]'}`}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            autoFocus
          />
        ) : (
          <div 
            className="px-1 text-slate-700 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: getHtmlContent() }} 
          />
        )}
      </div>
    </div>
  );
};
const AdminPanel = ({ mode, onBack }) => {
  const [previewData, setPreviewData] = useState([]);
  const [previewEdit, setPreviewEdit] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);  
  
  const [currentTab, setCurrentTab] = useState(mode || 'cauhoi');
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [otp, setOtp] = useState("");
   const [loiGiaiTraCuu, setLoiGiaiTraCuu] = useState("");
  const [loadingLG, setLoadingLG] = useState(false);
 
  const [jsonInput, setJsonInput] = useState('');
  const [subjects, setSubjects] = useState([]); // Khai báo này để chứa môn học
  const [duplicateGroups, setDuplicateGroups] = useState([]); // Câu trùng
   const [expandedGroupId, setExpandedGroupId] = useState(null); // Câu trùng
  const [previewQuestion, setPreviewQuestion] = useState(null); // Lưu câu hỏi đang xem
  const [showPreview, setShowPreview] = useState(false);        // Trạng thái đóng/mở
  const [editForm, setEditForm] = useState({ 
    idquestion: '', classTag: '', question: '', options: '', answer: '', loigiai: '' 
  });
  useEffect(() => {
  if (showPreview && window.MathJax) {
    // Chờ một chút để Modal render xong HTML rồi mới quét Latex
    setTimeout(() => {
      window.MathJax.typesetPromise();
    }, 100);
  }
}, [showPreview, previewQuestion]);
  // Thêm cái này vào trong AdminPanel
useEffect(() => {
  if (editForm.idquestion && window.MathJax) {
    const timer = setTimeout(() => {
      window.MathJax.typesetPromise().catch((err) => console.log(err));
    }, 500); // Tăng delay lên một chút để React render xong HTML từ JSON
    return () => clearTimeout(timer);
  }
}, [editForm]);
  // Bất cứ khi nào nhận data từ server:
const chuan_hoa = (data) => ({
  ...data,
  idquestion: data.id, // Tạo ra idquestion từ id
  id: data.id          // Giữ nguyên id
});
  // ========= Chọn môn học ======================
  useEffect(() => {
  const loadConfig = async () => {
    try {
      const response = await fetch(`${KETQUA_URL}?action=getAppConfig`);
      const result = await response.json();
      if (result.status === "success") {
        setSubjects(result.data.topics);
        console.log("✅ Đã nạp cấu hình thành công!");
      }
    } catch (err) {
      console.error("❌ Lỗi nạp Config:", err);
    }
  };
  loadConfig();
}, []);
  
  const [gvInfo, setGvInfo] = useState({ id: '', pass: '' });  
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
  useEffect(() => {
    if (mode) setCurrentTab(mode);
  }, [mode]);

  // --- 1. XỬ LÝ WORD ---===========================================================================================================================================================================
 const findQuestion = async () => {
  setLoading(true);
  try {
    const resp = await fetch(`${KETQUA_URL}?action=getQuestionById&id=${editForm.idquestion}`);
    const res = await resp.json();
    if (res.status === 'success') {
      // 💡 Hợp nhất dữ liệu thông minh
      setEditForm({ 
        ...editForm,     // Giữ ID đang gõ
        ...res.data,     // Đè dữ liệu mới từ server lên
        idquestion: res.data.id || res.data.idquestion, 
        id: res.data.id || res.data.idquestion 
      });
      setTimeout(() => window.MathJax?.typesetPromise(), 200);
    } else {
      alert("Không tìm thấy!");
    }
  } catch (e) {
    alert("Lỗi kết nối!");
  } finally { setLoading(false); }
};
  // ===========================================================================================================================================tách dữ liệu câu hỏi
  const handleWordParser = (text) => {
  if (!text || !text.trim()) {
    setJsonInput('');
    return;
  }

  const blocks = [];
  const rawParts = text.split('}#');

  rawParts.forEach(part => {
    const start = part.indexOf('{');
    if (start !== -1) {
      const block = part.slice(start).trim() + '}';
      blocks.push(block);
    }
  });

  if (!blocks.length) {
    alert("❌ Không tìm thấy block!");
    return;
  }

  const results = blocks.map((block) => {
    try {
      const obj = new Function(`return (${block})`)();

      return {
        id: obj.id,
        classTag: obj.classTag || "",
        type: obj.type || "",
        part: obj.part || "",
        question: obj.question || "",
        options: obj.o ? JSON.stringify(obj.o) :
                 obj.s ? JSON.stringify(obj.s) : "",
        answer: obj.a || "",
        loigiai: obj.loigiai || ""
      };

    } catch (e) {
      console.error("Parse lỗi:", block);
      return null;
    }
  }).filter(Boolean);

 setJsonInput(JSON.stringify(results, null, 2));
setPreviewData(results);
};
// ===================================load ngân hàng đề =====================
  const handleLoadQuestions = async () => {
  const resp = await fetch(`${KETQUA_URL}?action=loadQuestions`);
  const res = await resp.json();

  if (res.status === 'success') {
    setAllQuestions(res.data);
    alert("📚 Đã load ngân hàng câu hỏi!");
  } else {
    alert("Lỗi load!");
  }
};

// ======================================================================================Ghi câu hoi ngân hàng=========
  
 const handleSaveQuestions = async () => {
  if (!jsonInput) return alert("Chưa có dữ liệu!");
  setLoading(true);
  try {
    // Phải parse jsonInput thành mảng Object trước khi gửi
    const dataArray = previewData;
    
    const resp = await fetch(`${KETQUA_URL}?action=saveQuestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, 
      body: JSON.stringify(dataArray) 
    });
    
    const res = await resp.json();
    if (res.status === 'success') { 
      alert(`🚀 Thành công! Đã chèn thêm ${dataArray.length} câu hỏi vào ngân hàng .`); 
      setJsonInput(''); 
    } else {
      alert("Lỗi: " + res.message);
    }
  } catch (e) { 
    console.error(e);
    alert("Lỗi gửi dữ liệu! Thầy kiểm tra dữ liệu đầu vào có chuẩn mảng JSON không nhé."); 
  } finally { 
    setLoading(false); 
  }
};
// Up lG
const handleUploadLG = async () => {
  if (!jsonInput.trim()) return alert("Dán nội dung vào đã thầy ơi!");
  setLoading(true);
  try {
    const blocks = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < jsonInput.length; i++) {
      const ch = jsonInput[i];
      if (ch === '{') { if (depth === 0) current = ''; depth++; }
      if (depth > 0) current += ch;
      if (ch === '}') { depth--; if (depth === 0) blocks.push(current.trim()); }
    }

    const itemsToUpload = blocks.map(block => {
      const idMatch = block.match(/id\s*:\s*(\d+|["'][^"']+["'])/);
      const id = idMatch ? idMatch[1].replace(/["']/g, '') : null;
      return { id: id, loigiai: block };
    }).filter(item => item.id !== null);

    // Cách thầy đề xuất: Đưa action lên URL cho chắc chắn
    const resp = await fetch(`${KETQUA_URL}?action=saveLG`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(itemsToUpload) // Chỉ gửi mảng phẳng thôi
    });
    
    const result = await resp.text();
    alert(result);
    setJsonInput('');
  } catch (e) { alert("Lỗi gửi dữ liệu thầy ạ!"); }
  finally { setLoading(false); }
};

  // --- 2. XÁC MINHXỬ LÝ NHẬP CÂU HỎI & SỬA LẺ (Giữ nguyên logic của thầy) ---
 const handleVerifyAdminOTP = async () => {
  if (!otp) return alert("Vui lòng nhập mật khẩu!");
  
  setLoading(true);
  try {
    // Gửi tham số otp lên để Server đối chiếu với biến ADMIN_PASSWORD_DEFAULT
    const resp = await fetch(`${DANHGIA_URL}?action=checkAdminOTP&otp=${encodeURIComponent(otp.trim())}`);
    const res = await resp.json();
    
    if (res.status === "success") {
      if (res.verified === true) {
        setIsAdminVerified(true);
        // Có thể xóa otp sau khi verify thành công để bảo mật
        setOtp(""); 
      } else {
        alert("Mật khẩu Admin không chính xác!");
      }
    } else {
      alert("Lỗi phản hồi từ hệ thống!");
    }
  } catch (e) {
    console.error(e);
    alert("Lỗi kết nối server!");
  } finally {
    setLoading(false);
  }
};
  // Tìm đến đoạn này trong code của bạn (khoảng dòng 270-280)
if (!isAdminVerified) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-black mb-8">ADMIN SECURITY</h2>
        
        <input 
          type="password" 
          className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center text-4xl mb-8" 
          value={otp} 
          onChange={e => setOtp(e.target.value)} 
          placeholder="••••"
        />

        {/* THAY THẾ NÚT CŨ BẰNG NÚT MỚI Ở ĐÂY */}
        <button 
          onClick={handleVerifyAdminOTP} 
          disabled={loading}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
        >
          {loading ? (
            <><i className="fa-solid fa-spinner animate-spin"></i> ĐANG KIỂM TRA...</>
          ) : (
            "XÁC MINH"
          )}
        </button>
        
      </div>
    </div>
  );
}
// Hàm tìm câu trùng
const handleFindDuplicates = async () => {
  setLoading(true);
  try {
    const resp = await fetch(`${KETQUA_URL}?action=findDuplicateQuestions`);
    const res = await resp.json();
    if (res.status === 'success') {
      setDuplicateGroups(res.data);
      setCurrentTab('duplicate'); // Chuyển sang tab hiển thị
    }
  } catch (e) {
    alert("Lỗi tìm kiếm!");
  } finally {
    setLoading(false);
  }
};

// Hàm xóa câu hỏi trùng
const handleDeleteRow = async (rowIdx, idToDelete) => {
  if(!window.confirm(`Thầy chắc chắn muốn xóa id [${idToDelete}] khỏi ngân hàng?`)) return;
  
  try {
    const resp = await fetch(`${KETQUA_URL}?action=deleteQuestionRow&rowIdx=${rowIdx}`);
    const res = await resp.json();
    
   if(res.status === 'success') {
    alert(`🚀 Đã xóa id [${idToDelete}] thành công!`);
    handleFindDuplicates(); // Gọi lại để refresh lại index hàng cho chuẩn}
      
      // Cập nhật lại danh sách ngay lập tức để không phải load lại cả trang
      setDuplicateGroups(prev => prev.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== idToDelete)
      })).filter(group => group.items.length > 1));
      
    } else {
      alert("❌ Lỗi rồi: " + res.message);
    }
  } catch (e) { 
    alert("❌ Lỗi kết nối server rồi thầy ơi!"); 
  }
};
  // ===== xem chi tiết câu trùng ============ 
const handleOpenPreview = (item) => {
  setPreviewQuestion(item);
  setPreviewEdit(item);   // thêm dòng này
  setShowPreview(true);
};
  const handleDeleteInsidePreview = async (item) => {
  // Tận dụng lại hàm xóa thầy trò mình đã viết ở trên
  await handleDeleteRow(item.rowIdx, item.id);
  // Xóa xong thì tự động đóng Modal để về danh sách
  setShowPreview(false);
};
  // ========== Hàm sửa câu hỏi ========================================================================
  // =================================== CẬP NHẬT TỪNG PHẦN (4 LÔ) ===================================
const handleQuickUpdate = async (field, newValue) => {
  if (!editForm.idquestion && !editForm.id) {
    alert("Không tìm thấy ID câu hỏi!");
    return;
  }

  setLoading(true);
  try {
    // 1. Cập nhật state local ngay để thầy thấy thay đổi (Optimistic Update)
    const updatedForm = { ...editForm, [field]: newValue };
    setEditForm(updatedForm);

    // 2. Tạo payload KHỚP 100% tên cột trong sheetNH của thầy
    const payload = {
      data: {
        id: updatedForm.id || updatedForm.idquestion, // Khóa chính (Cột A)
        classTag: updatedForm.classTag || "",        // Cột B
        type: updatedForm.type || "",                // Cột C
        part: updatedForm.part || "",                // Cột D
        question: updatedForm.question || "",        // Cột E
        options: updatedForm.options || "",          // Cột F
        answer: updatedForm.answer || "",            // Cột G
        loigiai: updatedForm.loigiai || "",          // Cột H
        date: new Date().toLocaleString('vi-VN')    // Cột I (Tự động ghi ngày sửa)
      }
    };

    // 3. Gửi lên Google Apps Script
    const res = await fetch(`${KETQUA_URL}?action=updateQuestion`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    
    if (result.status === 'success') {
      alert(`✅ Đã lưu xong phần [${field}] vào sheetNH! Kaka.`);
      // Quét lại MathJax cho đẹp
      setTimeout(() => window.MathJax?.typesetPromise(), 200);
    } else {
      alert("❌ Lỗi Server: " + result.message);
    }

  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    alert("❌ Lỗi kết nối! Thầy kiểm tra mạng hoặc DANHGIA_URL nhé.");
  } finally {
    setLoading(false);
  }
};
  return (
 <div className="p-3 md:p-8 bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl max-w-6xl mx-auto my-4 md:my-6 border border-slate-50">
      <div className="flex items-center gap-2 mb-8 bg-white/50 backdrop-blur-md p-2 rounded-3xl w-fit shadow-sm border border-slate-200">
  {/* Nút Sửa câu hỏi */}
  <button 
    onClick={() => setCurrentTab('cauhoi')} 
    className={`flex items-center gap-2 px-4 py-2 text-[10px] rounded-2xl font-black text-xs uppercase transition-all ${
      currentTab === 'cauhoi' 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
      : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <i className="fa-solid fa-pen-to-square"></i> Sửa câu hỏi
  </button>
  
  {/* Nút Import Word */}
  <button 
    onClick={() => setCurrentTab('word')} 
    className={`flex items-center gap-2 px-4 py-2 text-[10px] rounded-2xl font-black text-xs uppercase transition-all ${
      currentTab === 'word' 
      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105' 
      : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <i className="fa-solid fa-file-word"></i> Import Word
  </button>
         {/* Nút Import LG - Thêm mới tại đây */}
<button 
  onClick={() => {setCurrentTab('lg'); setJsonInput('');}} 
  className={`flex items-center gap-2 px-4 py-2 text-[10px] rounded-2xl font-black text-xs uppercase transition-all ${
    currentTab === 'lg' 
    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105' 
    : 'text-slate-500 hover:bg-slate-100'
  }`}
>
  <i className="fa-solid fa-lightbulb"></i> Import LG
</button>
        {/* Nút tìm câu trùng: */}
<button 
  onClick={handleFindDuplicates} 
  className={`flex items-center gap-2 px-4 py-2 text-[10px] rounded-2xl font-black text-xs uppercase transition-all ${
    currentTab === 'duplicate' 
    ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-105' 
    : 'text-slate-500 hover:bg-slate-100'
  }`}
>
  <i className="fa-solid fa-clone"></i> {loading ? 'Đang quét...' : 'Tìm câu trùng'}
</button>

  {/* Vạch ngăn cách tinh tế */}
  <div className="w-[1px] h-6 bg-slate-300 mx-2"></div>

  {/* Nút Thoát ra - Rực rỡ và an toàn */}
  <button 
    onClick={onBack} 
    className="flex items-center gap-2 px-4 py-2 text-[10px] rounded-2xl font-black text-xs uppercase text-red-500 hover:bg-red-50 hover:scale-105 transition-all active:scale-95"
  >
    <i className="fa-solid fa-right-from-bracket"></i> Thoát ra
  </button>
</div>
      <div className="min-h-[500px]">
       {/* TAB 1: SỬA CÂU HỎI */}
{currentTab === 'cauhoi' && (
  <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
    
    {/* THANH TÌM KIẾM ID */}
    <div className="bg-white p-4 rounded-[2rem] shadow-sm border-2 border-slate-100 flex gap-3">
      <input 
        type="text" 
        placeholder="Nhập ID câu hỏi để sửa..." 
        className="flex-1 pl-6 py-3 bg-slate-50 rounded-2xl outline-none font-black text-blue-600 border-none"
        value={editForm.idquestion}
        onChange={e => setEditForm({...editForm, idquestion: e.target.value})}
      />
      <button onClick={findQuestion} className="px-8 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-md">
        {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'TÌM CÂU HỎI'}
      </button>
    </div>

    {editForm.question ? (
      <div className="grid grid-cols-1 gap-4">
        
        {/* LÔ 1: NỘI DUNG CÂU HỎI (QUESTION) */}
        <EditableSection 
          title="Nội dung câu hỏi" 
          value={editForm.question} 
          icon="fa-question-circle"
          onSave={(val) => handleQuickUpdate('question', val)} 
        />

        {/* LÔ 2: CÁC LỰA CHỌN (OPTIONS) */}
        <EditableSection 
          title="Các phương án (JSON)" 
          value={editForm.options} 
          icon="fa-list-ul"
          onSave={(val) => handleQuickUpdate('options', val)} 
        />

        {/* LÔ 3: ĐÁP ÁN ĐÚNG (ANSWER) */}
        <EditableSection 
          title="Đáp án đúng" 
          value={editForm.answer} 
          icon="fa-check-double"
          isSmall={true}
          onSave={(val) => handleQuickUpdate('answer', val)} 
        />

        {/* LÔ 4: LỜI GIẢI (LOIGIAI) */}
        <EditableSection 
          title="Lời giải chi tiết" 
          value={editForm.loigiai} 
          icon="fa-lightbulb"
          onSave={(val) => handleQuickUpdate('loigiai', val)} 
        />

        {/* NÚT THOÁT DƯỚI CÙNG */}
        <div className="flex justify-center pt-6">
            <button 
                onClick={() => setEditForm({ idquestion: '', question: '', options: '', answer: '', loigiai: '' })}
                className="px-12 py-4 bg-slate-200 text-slate-600 rounded-[2rem] font-black hover:bg-red-50 hover:text-red-600 transition-all uppercase text-xs tracking-widest"
            >
                <i className="fa-solid fa-power-off mr-2"></i> Thoát sửa câu này
            </button>
        </div>
      </div>
    ) : (
      <div className="py-20 text-center text-slate-300 italic bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <i className="fa-solid fa-magnifying-glass text-5xl mb-4 opacity-20"></i>
          <p>Nhập ID để nạp dữ liệu chỉnh sửa thầy nhé!</p>
      </div>
    )}
  </div>
)}
       {/* TAB 2: IMPORT WORD */}
{currentTab === 'word' && (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      
      {/* CỘT 1: NHẬP LIỆU (CHIẾM 4 PHẦN) */}
     <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
        <div className="bg-slate-100 p-5 rounded-[2.5rem] border border-slate-200">
          <label className="block text-[10px] font-black text-slate-500 mb-2 ml-2 uppercase tracking-wider">
            1. Dán nội dung từ Word
          </label>
          <textarea 
            className="w-full min-h-[220px] md:h-[600px] p-4 md:p-6 bg-white rounded-[2rem] text-sm shadow-inner text-sm outline-none focus:ring-2 ring-orange-400 transition-all" 
            placeholder="Dán nội dung dạng {id: 601...}# vào đây..." 
            onChange={(e) => handleWordParser(e.target.value)} 
          />
        </div>
      </div>

      {/* CỘT 2: XEM TRƯỚC (CHIẾM 6 PHẦN) */}
      <div className="lg:col-span-6 space-y-4 order-1 lg:order-2">
        <div className="bg-white p-5 rounded-[2.5rem] border-2 border-slate-100 shadow-sm min-h-[300px] lg:h-[600px] flex flex-col">
          
          {/* HEADER CỦA CỘT REVIEW: CHỨA TIÊU ĐỀ VÀ NÚT LƯU */}
          <div className="flex items-center justify-between mb-4 px-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              2. Review hiển thị thực tế
            </label>
            
            <button 
              onClick={handleSaveQuestions} 
              disabled={!jsonInput || loading} 
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-black text-xs shadow-lg hover:shadow-orange-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center gap-2"
            >
              {loading ? (
                <i className="fa-solid fa-spinner animate-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  ĐẨY LÊN SHEET NH
                </>
              )}
            </button>
          </div>

          <div className="flex-1 bg-slate-50 rounded-[1.5rem] p-4 overflow-y-auto border border-dashed border-slate-200">
            {previewData.length > 0 ? (
              <QuestionPreviewBlock
  data={previewData}
  onUpdate={setPreviewData}
/>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-sm space-y-2">
                <i className="fa-solid fa-eye-slash text-2xl"></i>
                <span>Chưa có dữ liệu để xem trước...</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  </div>
)}
        
        {/* TAB 3: IMPORT LỜI GIẢI TRONG NGÂN HÀNG CÂU HỎI */}
{currentTab === 'lg' && (
  <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4">
    <div className="bg-emerald-50 p-8 rounded-[3rem] border-2 border-dashed border-emerald-200">
      <textarea 
        className="w-full h-80 p-6 bg-white rounded-[2rem] shadow-inner text-sm outline-none focus:ring-2 ring-emerald-500 font-mono mb-4" 
        placeholder="Dán JSON lời giải từ file Word vào đây..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      <button 
        onClick={handleUploadLG} 
        disabled={loading || !jsonInput}
        className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl"
      >
        {loading ? "ĐANG LƯU..." : "CẬP NHẬT LỜI GIẢI"}
      </button>
    </div>
  </div>
)}
        {/* TÌM CÂU TRÙNG */}
        {currentTab === 'duplicate' && (
  <div className="space-y-4 animate-in fade-in">
    <h3 className="text-xl font-black text-slate-800 mb-4 px-4">Các nhóm câu hỏi nghi trùng lặp</h3>
    {duplicateGroups.length === 0 ? (
      <p className="text-center py-20 text-slate-400 italic">Tuyệt vời! Không phát hiện câu trùng lặp nào.</p>
    ) : (
      duplicateGroups.map((group, idx) => (
        <div key={idx} className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-6 flex justify-between items-center bg-slate-50">
            <div>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black mr-2">
                TRÙNG {group.score}%
              </span>
              <span className="font-bold text-slate-700 underline">Gốc: {group.mainId}</span>
              <span className="ml-3 text-xs text-slate-400">({group.items.length} câu tương tự)</span>
            </div>
            <button 
              onClick={() => setExpandedGroupId(expandedGroupId === idx ? null : idx)}
              className="text-blue-600 font-bold text-xs"
            >
              {expandedGroupId === idx ? 'Thu gọn' : 'Xem chi tiết'}
            </button>
          </div>
          
          {expandedGroupId === idx && (
            <div className="p-4 space-y-2 bg-white">
              {group.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-white">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600">ID: {item.id} | Tag: {item.classTag}</p>
                    <p className="text-sm text-slate-500 line-clamp-1 italic">"{item.question}"</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                    onClick={() => handleOpenPreview(item)} // Gọi hàm preview mới
                    className="p-2 px-4 bg-blue-100 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                    CHI TIẾT
                    </button>
                    <button 
                      onClick={() => handleDeleteRow(item.rowIdx, item.id)}
                      className="p-2 px-4 bg-red-100 text-red-600 rounded-xl text-[10px] font-bold hover:bg-red-600 hover:text-white transition-all"
                    >
                      XÓA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))
    )}
  </div>
)}
        {/* MODAL PREVIEW CÂU HỎI */}
{/* MODAL PREVIEW CÂU HỎI */}
{showPreview && previewQuestion && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    
    <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
        <div>
          <h4 className="font-black text-slate-800">PREVIEW CÂU HỎI</h4>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">
            ID: {previewQuestion.id} | Tag: {previewQuestion.classTag}
          </p>
        </div>

        <button
          onClick={() => {
            setShowPreview(false);
            setPreviewEdit(null);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-red-50 text-red-500 transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 md:p-6 flex-1 overflow-y-auto space-y-4">

               <EditableSection
          title="Nội dung câu hỏi"
          value={previewEdit?.question}
          icon="fa-question-circle"
          onSave={(val) => {
            setPreviewEdit(prev => ({ ...prev, question: val }));
            handleQuickUpdate('question', val);
          }}
        />

        <EditableSection
          title="Các phương án (JSON)"
          value={previewEdit?.options}
          icon="fa-list-ul"
          onSave={(val) => {
            setPreviewEdit(prev => ({ ...prev, options: val }));
            handleQuickUpdate('options', val);
          }}
        />

        <EditableSection
          title="Đáp án đúng"
          value={previewEdit?.answer}
          icon="fa-check-double"
          isSmall={true}
          onSave={(val) => {
            setPreviewEdit(prev => ({ ...prev, answer: val }));
            handleQuickUpdate('answer', val);
          }}
        />

        <EditableSection
          title="Lời giải chi tiết"
          value={previewEdit?.loigiai}
          icon="fa-lightbulb"
          onSave={(val) => {
            setPreviewEdit(prev => ({ ...prev, loigiai: val }));
            handleQuickUpdate('loigiai', val);
          }}
        />

      </div>

      {/* Footer */}
      <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
        
        <button
          onClick={() => handleDeleteInsidePreview(previewQuestion)}
          className="px-4 py-2 text-[10px] bg-red-100 text-red-600 rounded-2xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all"
        >
          <i className="fa-solid fa-trash mr-2"></i> XÓA CÂU NÀY
        </button>

        <button
          onClick={() => {
            setShowPreview(false);
            setPreviewEdit(null);
          }}
          className="px-4 py-2 text-[10px] bg-slate-200 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-300 transition-all"
        >
          ĐÓNG
        </button>

      </div>

    </div>
  </div>
)}
        {loiGiaiTraCuu && (
  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 my-2 whitespace-pre-wrap">
    <strong>Lời giải:</strong> {loiGiaiTraCuu}
  </div>
)}
  {loading && (
  <div className="fixed inset-0 bg-white/50 backdrop-blur-[2px] z-[1000] flex items-center justify-center touch-none">
    <div className="flex flex-col items-center gap-3">
      <i className="fa-solid fa-spinner animate-spin text-4xl text-blue-600"></i>
      <span className="font-black text-xs text-blue-600 tracking-widest animate-pulse">ĐANG CẬP NHẬT... KAKA</span>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default AdminPanel;
