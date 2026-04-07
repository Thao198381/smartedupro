import { Question } from './types';
import { KETQUA_URL } from './config';

export let questionsBankW: Question[] = [];

// Hàm trộn mảng ngẫu nhiên cơ bản
const shuffle = <T>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const shuffleByTypeParts = (data: Question[]): Question[] => {
  const mcq: Question[] = [];
  const tf: Question[] = [];
  const sa: Question[] = [];
  const other: Question[] = [];

  data.forEach(q => {
    const type = (q.type || '').toLowerCase().trim();
     // clone object để tránh mutate dữ liệu gốc
    const newQ: Question = { ...q };

    // trộn đáp án trắc nghiệm
    if (type === 'mcq' && Array.isArray(q.o)) {
      q.o = shuffle(q.o);
    }

    // trộn mệnh đề đúng sai
    if (type === 'true-false' && Array.isArray(q.s)) {
      q.s = shuffle(q.s);
    }

    if (type === 'mcq') mcq.push(q);
    else if (type === 'true-false' || type === 'tf') tf.push(q);
    else if (type === 'short-answer' || type === 'sa') sa.push(q);
    else other.push(q);
  });
  console.log("MCQ shuffled:", mcq);
  console.log("TF shuffled:", tf);

  return [
    ...shuffle(mcq),
    ...shuffle(tf),
    ...shuffle(sa),
    ...shuffle(other)
  ];
};

export const fetchQuestionsBankW = async (
  examCode?: string,
  idgv?: string,
  customUrl?: string
): Promise<Question[]> => {
  try {
    let targetUrl = KETQUA_URL;
    const finalUrl = examCode
      ? `${targetUrl}?action=getQuestionsByCode&examCode=${examCode}`
      : `${targetUrl}?action=getQuestions`;

    const response = await fetch(finalUrl);
    const result = await response.json();

    if (result.status === "success" && Array.isArray(result.data)) {
      // THỰC HIỆN TRỘN THEO PHẦN TRƯỚC KHI GÁN
      questionsBankW = shuffleByTypeParts(result.data);
      console.log("Dữ liệu đã trộn theo Type:", questionsBankW);
      return questionsBankW;
    }
    return [];
  } catch (error) {
    console.error("Lỗi fetch questions:", error);
    return [];
  }
};
