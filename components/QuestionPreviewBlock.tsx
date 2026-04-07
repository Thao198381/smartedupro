import React, { useEffect, useState } from 'react';

const QuestionPreviewBlock = ({ data, onUpdate }) => {

  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (window.MathJax) {
      const timer = setTimeout(() => {
        window.MathJax.typesetPromise().catch((err) => console.log(err));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data, editData]);

  if (!data || data.length === 0) return null;

 const startEdit = (index, item) => {

  let formattedOptions = item.options;

  try {
    const parsed = typeof item.options === "string"
      ? JSON.parse(item.options)
      : item.options;

    if (Array.isArray(parsed)) {

      // TRUE FALSE
      if (typeof parsed[0] === "object") {
        formattedOptions = parsed
          .map(o => `${o.text} | ${o.a}`)
          .join("\n");
      }

      // MCQ
      else {
        formattedOptions = parsed.join("\n");
      }
    }

  } catch(e){}

  setEditingIndex(index);
  setEditData({
    ...item,
    options: formattedOptions
  });
};

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData({});
  };

 const saveEdit = (index) => {

  let parsedOptions = editData.options;

  try {

    const lines = editData.options
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    // TRUE FALSE
    if (lines[0].includes("|")) {

      parsedOptions = lines.map(line => {

        const [text, a] = line.split("|");

        return {
          text: text.trim(),
          a: a.trim() === "true"
        };

      });

    } else {

      // MCQ
      parsedOptions = lines;

    }

  } catch(e){}

  const updated = {
    ...editData,
    options: JSON.stringify(parsedOptions)
  };

  data[index] = updated;

  setEditingIndex(null);
  setEditData({});
};

  const renderOptions = (item) => {
    try {

      const isShortAnswer = !item.options || item.options === "" || item.options === "[]";
      if (isShortAnswer) {
        return (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-100 rounded-[1.5rem] flex items-center justify-between">
            <span className="text-[10px] font-black text-blue-600 uppercase">Đáp số:</span>
            <b className="text-xl text-blue-700 tracking-widest">{item.answer}</b>
          </div>
        );
      }

      const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;

      if (Array.isArray(options) && typeof options[0] === 'object') {
        return (
          <div className="space-y-2 mt-4">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-blue-600 text-xs italic">{String.fromCharCode(97 + i)})</span>
                <span className="text-sm flex-1">{opt.text}</span>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${opt.a ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {opt.a ? 'ĐÚNG' : 'SAI'}
                </span>
              </div>
            ))}
          </div>
        );
      }

      const labels = ['A', 'B', 'C', 'D'];
      const entries = Array.isArray(options) ? options : Object.values(options);
      
      return (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entries.map((text, i) => {
              const isCorrect = item.answer === labels[i];
              return (
                <div key={i} className={`p-3 rounded-xl border-2 flex items-center gap-3 ${isCorrect ? 'border-rose-200 bg-rose-50/30' : 'border-slate-50 bg-white'}`}>
                  <b className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] ${isCorrect ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {labels[i]}
                  </b>
                  <span className={`text-sm ${isCorrect ? 'font-semibold text-rose-900' : 'text-slate-600'}`}>{text}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end">
            <div className="bg-rose-600 text-white px-6 py-2 rounded-2xl shadow-lg shadow-rose-200 flex items-center gap-3 animate-bounce-short">
              <b className="text-2xl font-black">ĐÁP ÁN: {item.answer}</b>
            </div>
          </div>
        </div>
      );
    } catch (e) {
      return <div className="mt-2 p-3 bg-slate-100 rounded-lg text-xs italic text-rose-500">Lỗi dữ liệu: {item.answer}</div>;
    }
  };

  return (
    <div className="h-full space-y-8 overflow-y-auto pr-4 no-scrollbar scroll-smooth">
      {data.map((item, index) => {

        const editing = editingIndex === index;

        return (
          <div key={index} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm relative animate-fade-in group">

            {/* Header */}
            <div className="absolute top-0 left-0 flex items-center">
              <div className="bg-slate-900 text-white px-6 py-2 rounded-br-[1.5rem] font-black text-xs uppercase tracking-widest">
                Câu {index + 1}
              </div>

              <div className="px-4 text-[10px] font-bold text-slate-400">
                ID: {item.id} • ClassTag: {item.classTag}
              </div>

              <div className="ml-3 flex gap-2">

                {!editing && (
                  <button
                    onClick={() => startEdit(index, item)}
                    className="text-[10px] px-3 py-1 bg-blue-500 text-white rounded-lg"
                  >
                    SỬA
                  </button>
                )}

                {editing && (
                  <>
                    <button
                      onClick={() => saveEdit(index)}
                      className="text-[10px] px-3 py-1 bg-emerald-500 text-white rounded-lg"
                    >
                      LƯU
                    </button>

                    <button
                      onClick={cancelEdit}
                      className="text-[10px] px-3 py-1 bg-slate-400 text-white rounded-lg"
                    >
                      HỦY
                    </button>
                  </>
                )}

              </div>
            </div>

            {/* QUESTION */}
            <div className="mt-8 text-slate-800 font-medium leading-relaxed preview-content text-lg">

              {editing ? (
               <textarea
  className="w-full border rounded-xl p-4 mt-4 min-h-[200px] font-mono text-sm leading-relaxed resize-y"
  value={editData.question}
  onChange={(e)=>setEditData({...editData, question:e.target.value})}
/>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: item.question }} />
              )}

            </div>

            {/* OPTIONS */}
            {editing ? (
  <textarea
    className="w-full border rounded-xl p-4 mt-4 min-h-[160px] resize-y"
    value={editData.options}
    onChange={(e)=>setEditData({...editData, options:e.target.value})}
  />
) : (
  renderOptions(item)
)}

            {/* ANSWER */}
            {editing && (
              <div className="mt-4">
                <textarea
                  className="w-full border rounded-xl p-4 min-h-[80px]"
                  value={editData.answer}
                  onChange={(e)=>setEditData({...editData, answer:e.target.value})}
                />
              </div>
            )}

            {/* LOIGIAI */}
            {editing ? (
              <textarea
               className="w-full border rounded-xl p-4 mt-4 min-h-[200px] resize-y"
                value={editData.loigiai || ""}
                onChange={(e)=>setEditData({...editData, loigiai:e.target.value})}
              />
            ) : (
              item.loigiai && (
                <div className="mt-6 p-6 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-[0.2em]">
                    Hướng dẫn giải
                  </span>
                  <div className="text-sm text-slate-600 italic leading-relaxed" dangerouslySetInnerHTML={{ __html: item.loigiai }} />
                </div>
              )
            )}

          </div>
        );
      })}
      <div className="h-20"></div>
    </div>
  );
};

export default QuestionPreviewBlock;
