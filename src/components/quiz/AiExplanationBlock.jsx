import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

function cleanAiText(raw) {
  if (!raw) return '';
  let text = raw;

  text = text.replace(/^#{1,6}\s+/gm, '');
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '$1');
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/___(.*?)___/g, '$1');
  text = text.replace(/__(.*?)__/g, '$1');
  text = text.replace(/_(.*?)_/g, '$1');

  text = text.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
  });
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/^[\s]*[-*+]\s+/gm, '  \u2022 ');
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

function renderCleanText(text) {
  if (!text) return null;

  const cleaned = cleanAiText(text);
  const paragraphs = cleaned.split('\n\n');

  return paragraphs.map((para, i) => {
    const lines = para.split('\n');
    const isList =
      lines.length > 1 &&
      lines.every((l) => /^\s*(\d+[.)]\s|[•]\s)/.test(l) || l.trim() === '');

    if (isList) {
      return (
        <div key={i} className="space-y-1">
          {lines
            .filter((l) => l.trim())
            .map((line, j) => (
              <p key={j} className="leading-relaxed pl-1">
                {line}
              </p>
            ))}
        </div>
      );
    }

    return (
      <p key={i} className="leading-relaxed whitespace-pre-line">
        {para}
      </p>
    );
  });
}

function buildSystemPrompt() {
  return `Kamu adalah tutor akademik cerdas yang membantu mahasiswa Indonesia memahami materi kuliah. Tugasmu adalah memberikan pembahasan soal yang jelas, terstruktur, dan mudah dipahami.

ATURAN PENTING:
- Gunakan Bahasa Indonesia yang baik dan natural
- JANGAN gunakan format Markdown apapun (tidak boleh pakai tanda bintang, hashtag, backtick, dsb)
- Tulis dalam paragraf biasa dengan kalimat yang mengalir
- Gunakan penomoran angka biasa (1. 2. 3.) jika perlu membuat daftar
- Gunakan huruf kapital untuk penekanan, bukan bold/italic
- Pisahkan bagian-bagian dengan baris kosong saja
- Jelaskan dengan ringkas tapi mendalam

FORMAT PEMBAHASAN:

Untuk soal Pilihan Ganda:
1. Sebutkan jawaban yang benar
2. Jelaskan MENGAPA jawaban tersebut benar (konsep utamanya)
3. Jelaskan singkat mengapa opsi lain salah
4. Jika ada referensi halaman, sebutkan

Untuk soal Isian Singkat:
1. Sebutkan jawaban yang benar
2. Jelaskan definisi atau konsep di balik jawaban
3. Berikan contoh penerapan jika relevan

Untuk soal Essay:
1. Berikan poin-poin kunci yang seharusnya ada dalam jawaban
2. Jelaskan rubrik penilaian secara ringkas
3. Berikan contoh jawaban ideal yang singkat`;
}

function buildUserPrompt(qData, userAnswer, isCorrect) {
  const type = qData?.type || 'MULTIPLE_CHOICE';
  const questionText = qData?.questionText || '';
  const options = qData?.options || [];
  const correctAnswer = qData?.correctAnswer || '';
  const pageReference = qData?.pageReference;
  const explanation = qData?.explanation;
  const essayRubric = qData?.essayRubric;
  const sessionInfo = qData?.session || qData?.sessionInfo;

  let prompt = '';

  if (sessionInfo) {
    prompt += `Mata kuliah pertemuan ke-${sessionInfo.sessionNumber}`;
    if (sessionInfo.topicTitle) prompt += ` tentang "${sessionInfo.topicTitle}"`;
    prompt += '.\n';
  }

  if (pageReference) {
    prompt += `Referensi: Slide halaman ${pageReference}.\n`;
  }

  prompt += `\nTipe soal: ${
    type === 'MULTIPLE_CHOICE'
      ? 'Pilihan Ganda'
      : type === 'SHORT_ANSWER'
      ? 'Isian Singkat'
      : 'Essay'
  }\n`;
  prompt += `\nSoal:\n${questionText}\n`;

  if (type === 'MULTIPLE_CHOICE' && Array.isArray(options)) {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    prompt += '\nPilihan jawaban:\n';
    options.forEach((opt, i) => {
      if (opt) prompt += `${letters[i]}. ${opt}\n`;
    });
  }

  if (correctAnswer) {
    prompt += `\nKunci jawaban yang benar: ${correctAnswer}\n`;
  }

  if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
    prompt += `Jawaban mahasiswa: ${userAnswer}`;
    if (isCorrect === true) prompt += ' (BENAR)';
    else if (isCorrect === false) prompt += ' (SALAH)';
    prompt += '\n';
  }

  if (explanation) {
    prompt += `\nPembahasan manual yang sudah ada: ${explanation}\n`;
    prompt += 'Perkaya pembahasan di atas dengan penjelasan yang lebih mendalam.\n';
  }

  if (essayRubric) {
    prompt += `\nRubrik penilaian essay: ${essayRubric}\n`;
  }

  prompt += '\nBerikan pembahasan yang jelas dan mudah dipahami.';

  return prompt;
}

function buildStructuredAcademicExplanation(qData, userAnswer, isCorrect) {
  const type = qData?.type || 'MULTIPLE_CHOICE';
  const questionText = qData?.questionText || 'soal latihan ini';
  const options = Array.isArray(qData?.options) ? qData.options : [];
  const correctAnswer = qData?.correctAnswer || '';
  const pageReference = qData?.pageReference;
  const explanation = qData?.explanation;
  const essayRubric = qData?.essayRubric;
  const sessionInfo = qData?.session || qData?.sessionInfo;

  const letters = ['A', 'B', 'C', 'D', 'E'];
  const correctIdx = letters.indexOf(String(correctAnswer).toUpperCase());
  const correctOptionText =
    correctIdx >= 0 && options[correctIdx]
      ? `${correctAnswer}. ${options[correctIdx]}`
      : correctAnswer || 'Sesuai kunci jawaban dosen';

  const sections = [];

  if (type === 'MULTIPLE_CHOICE') {
    sections.push(
      `1. JAWABAN YANG BENAR: Pilihan yang tepat adalah ${correctOptionText}.${
        userAnswer
          ? isCorrect
            ? ` Jawaban kamu (${userAnswer}) sudah BENAR dan sesuai dengan konsep pada materi perkuliahan.`
            : ` Jawaban yang kamu pilih (${userAnswer}) masih belum tepat.`
          : ''
      }`
    );

    if (explanation) {
      sections.push(
        `2. PEMBAHASAN KONSEP UTAMA: ${explanation}`
      );
    } else {
      sections.push(
        `2. PEMBAHASAN KONSEP UTAMA: Pada pertanyaan "${questionText}", opsi ${correctOptionText} merupakan pernyataan yang paling tepat karena menjawab inti permasalahan sesuai definisi dan prinsip materi${
          sessionInfo?.topicTitle ? ` "${sessionInfo.topicTitle}"` : ' perkuliahan'
        }.`
      );
    }

    const otherOptions = options
      .map((opt, idx) => ({ letter: letters[idx], text: opt }))
      .filter((item) => item.letter !== correctAnswer && item.text);

    if (otherOptions.length > 0) {
      const listStr = otherOptions
        .map((o) => `Opsi ${o.letter} (${o.text})`)
        .join('; ');
      sections.push(
        `3. MENGAPA OPSI LAIN KURANG TEPAT: ${listStr} tidak dipilih karena tidak menggambarkan karakteristik atau fungsi utama yang ditanyakan pada soal.`
      );
    }
  } else if (type === 'SHORT_ANSWER') {
    sections.push(`1. KUNCI JAWABAN: ${correctAnswer || '-'}`);
    sections.push(
      `2. PENJELASAN KONSEP: ${
        explanation ||
        `Konsep "${correctAnswer}" merupakan istilah kunci yang merujuk langsung pada pertanyaan "${questionText}" dalam materi pertemuan ini.`
      }`
    );
  } else {
    sections.push(
      `1. POIN KUNCI JAWABAN IDEAL: ${
        essayRubric ||
        explanation ||
        'Jawaban essay yang baik perlu mencakup pengertian dasar, penjelasan cara kerja atau langkah-langkah utama, serta contoh penerapannya.'
      }`
    );
  }

  if (pageReference || sessionInfo) {
    sections.push(
      `4. REFERENSI SLIDE: Pelajari lebih lanjut pada materi ${
        sessionInfo
          ? `Pertemuan M-${String(sessionInfo.sessionNumber || 1).padStart(2, '0')}${
              sessionInfo.topicTitle ? ` (${sessionInfo.topicTitle})` : ''
            }`
          : 'perkuliahan'
      }${pageReference ? `, khususnya pada Slide Halaman ${pageReference}` : ''}.`
    );
  }

  return sections.join('\n\n');
}

export default function AiExplanationBlock({
  questionId,
  userAnswer,
  isCorrect,
  cachedExplanation,
  questionData,
}) {
  const storageKey = questionId ? `vizo_ai_explain_${questionId}` : null;
  const initialCache =
    cachedExplanation || (storageKey ? localStorage.getItem(storageKey) : null) || '';

  const [aiText, setAiText] = useState(initialCache);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(!!initialCache);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(!!initialCache);

  const saveCache = useCallback(
    (text) => {
      if (storageKey && text && text.trim()) {
        try {
          localStorage.setItem(storageKey, text.trim());
        } catch {
          // ignore storage quota errors
        }
      }
    },
    [storageKey]
  );

  // Stream from backend /quiz/questions/:id/explain endpoint
  const tryBackendExplain = async (endpointUrl, token, forceRegenerate) => {
    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userAnswer,
        isCorrect,
        regenerate: !!forceRegenerate,
      }),
    });

    const contentType = res.headers.get('content-type') || '';

    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.explanation) {
        setAiText(data.explanation);
        saveCache(data.explanation);
        setDone(true);
        return true;
      }
    }

    if (res.ok && contentType.includes('text/event-stream')) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let hadStreamError = false;

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.token) {
              accumulated += event.token;
              setAiText(accumulated);
            }
            if (event.done && event.full) {
              accumulated = event.full;
              setAiText(event.full);
            }
            if (event.error) {
              hadStreamError = true;
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      if (!hadStreamError && accumulated.trim().length > 0) {
        saveCache(accumulated);
        setDone(true);
        return true;
      }
    }

    return false;
  };

  // Direct OpenAI-compatible AI completion fallback (via Vite proxy or direct URL)
  const tryDirectAiCompletion = async () => {
    const apiKey =
      import.meta.env.VITE_AI_API_KEY || 'sk-d7c4369c7a0ff2b4-47kec0-e94afa91';
    const model = import.meta.env.VITE_AI_MODEL || 'gh/gpt-4o';
    const baseUrls = [
      '/ai-proxy',
      import.meta.env.VITE_AI_BASE_URL || 'https://9.ahmdmzki.web.id/v1',
    ];

    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(questionData, userAnswer, isCorrect) },
    ];

    for (const base of baseUrls) {
      try {
        const res = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            temperature: 0.7,
            stream: true,
            messages,
          }),
        });

        if (!res.ok) continue;

        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim()) {
            setAiText(content);
            saveCache(content);
            setDone(true);
            return true;
          }
        }

        if (contentType.includes('text/event-stream') || res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let accumulated = '';

          while (true) {
            const { done: streamDone, value } = await reader.read();
            if (streamDone) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === '[DONE]') continue;

              try {
                const parsed = JSON.parse(payload);
                const delta =
                  parsed.choices?.[0]?.delta?.content ??
                  parsed.choices?.[0]?.message?.content ??
                  parsed.token;
                if (delta) {
                  accumulated += delta;
                  setAiText(accumulated);
                }
              } catch {
                // skip
              }
            }
          }

          if (accumulated.trim().length > 0) {
            saveCache(accumulated);
            setDone(true);
            return true;
          }
        }
      } catch {
        // try next endpoint
      }
    }

    return false;
  };

  const requestExplanation = useCallback(
    async (forceRegenerate = false) => {
      setLoading(true);
      setError(null);
      setAiText('');
      setDone(false);
      setExpanded(true);

      try {
        const token =
          localStorage.getItem('vizo_token') || localStorage.getItem('token');
        const configuredBase = import.meta.env.VITE_API_URL || '/api';

        // 1. Try configured API backend first
        let succeeded = false;
        try {
          succeeded = await tryBackendExplain(
            `${configuredBase}/quiz/questions/${questionId}/explain`,
            token,
            forceRegenerate
          );
        } catch {
          succeeded = false;
        }

        // 2. If configuredBase is remote and returned 404/error, try local /api proxy
        if (!succeeded && configuredBase !== '/api') {
          try {
            succeeded = await tryBackendExplain(
              `/api/quiz/questions/${questionId}/explain`,
              token,
              forceRegenerate
            );
          } catch {
            succeeded = false;
          }
        }

        // 3. If backend /explain route is not yet deployed on remote server, call AI completion directly
        if (!succeeded && questionData) {
          succeeded = await tryDirectAiCompletion();
        }

        // 4. Final fallback: generate structured academic explanation from question data
        if (!succeeded && questionData) {
          const fallbackText = buildStructuredAcademicExplanation(
            questionData,
            userAnswer,
            isCorrect
          );
          // Smooth typing effect for UX consistency
          const words = fallbackText.split(' ');
          let current = '';
          for (let i = 0; i < words.length; i += 4) {
            current += (i === 0 ? '' : ' ') + words.slice(i, i + 4).join(' ');
            setAiText(current);
            await new Promise((r) => setTimeout(r, 18));
          }
          saveCache(fallbackText);
          setDone(true);
          succeeded = true;
        }

        if (!succeeded) {
          setError('Gagal memuat pembahasan AI. Silakan coba lagi.');
        }
      } catch (err) {
        console.error('AI explanation error:', err);
        setError('Gagal terhubung ke layanan AI. Periksa koneksi internet.');
      } finally {
        setLoading(false);
      }
    },
    [questionId, userAnswer, isCorrect, questionData, saveCache]
  );

  if (!expanded && !initialCache) {
    return (
      <button
        type="button"
        onClick={() => requestExplanation(false)}
        disabled={loading}
        className="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#EAF2FF] hover:bg-[#CFE2FF] border border-[#CFE2FF] transition-all flex items-center justify-center gap-2 text-[12px] font-semibold text-[#1D63FF]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memuat Pembahasan AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Minta Pembahasan AI</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-[#CFE2FF] bg-[#F4F7FE] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#EAF2FF] border-b border-[#CFE2FF] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1D63FF]" />
          <span className="text-[12px] font-bold text-[#1D63FF]">
            Pembahasan AI
          </span>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D63FF]" />}
        </div>
        {done && !loading && (
          <button
            type="button"
            onClick={() => requestExplanation(true)}
            className="text-[11px] font-semibold text-[#1D63FF] hover:underline flex items-center gap-1"
            title="Buat ulang pembahasan AI"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Buat Ulang</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3.5">
        {error ? (
          <div className="flex items-start gap-2 text-[#E11D48]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-[12px] font-semibold">{error}</p>
              <button
                type="button"
                onClick={() => requestExplanation(true)}
                className="mt-1.5 text-[11px] text-[#E11D48] underline"
              >
                Coba lagi
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[13px] text-[#1E293B] space-y-2.5">
            {renderCleanText(aiText)}
            {loading && !done && (
              <span className="inline-block w-1.5 h-4 bg-[#1D63FF] animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      {(done || initialCache) && !error && (
        <div className="px-4 py-2 bg-white/70 border-t border-[#CFE2FF] text-[11px] text-[#64748B] flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#1D63FF]" />
          <span>
            Dibuat oleh AI — Selalu verifikasi dengan materi slide dosen.
          </span>
        </div>
      )}
    </div>
  );
}
