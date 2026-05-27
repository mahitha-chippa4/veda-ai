'use client';

import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { GeneratedPaper, Question } from '@/types';

interface ExportOptions {
  title?: string;
  class?: string;
  subject?: string;
  schoolName?: string;
}

export function usePDFExport() {
  const exportToPDF = useCallback(
    async (paper: GeneratedPaper, opts?: ExportOptions) => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;

      const school =
        opts?.schoolName || paper.schoolName || 'VedaAI Assessment';

      const checkNewPage = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // ── Header box ──────────────────────────────────────────────────────────
      doc.setFillColor(26, 26, 26);
      doc.roundedRect(margin - 5, y - 5, contentWidth + 10, 42, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text(school, pageWidth / 2, y + 7, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(209, 213, 219);
      doc.text(
        `Subject: ${paper.subject || opts?.subject || '—'}   |   Class: ${paper.class || opts?.class || '—'}`,
        pageWidth / 2,
        y + 17,
        { align: 'center' }
      );

      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      const metaLeft = `Time Allowed: ${paper.duration || '—'}`;
      const metaRight = `Maximum Marks: ${paper.totalMarks || '—'}`;
      doc.text(metaLeft, margin, y + 27);
      doc.text(metaRight, pageWidth - margin, y + 27, { align: 'right' });

      y += 52;

      // ── Student info ─────────────────────────────────────────────────────────
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin - 5, y, contentWidth + 10, 28, 2, 2, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(26, 26, 26);
      doc.text('Name: ___________________________', margin + 4, y + 9);
      doc.text('Roll Number: ____________________', margin + 4, y + 19);
      doc.text('Section: ________________________', pageWidth / 2 + 4, y + 9);
      doc.text('Date: ___________________________', pageWidth / 2 + 4, y + 19);

      y += 34;

      // General instructions divider
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(107, 114, 128);
      doc.text(
        'General Instructions: Answer all questions. Read each question carefully before answering.',
        margin,
        y
      );
      y += 10;

      // ── Sections ─────────────────────────────────────────────────────────────
      let globalQuestionNum = 0;
      let sectionIndex = 0;

      const renderSectionToPDF = (title: string, questions: Question[], instruction?: string) => {
        if (!questions || questions.length === 0) return;
        const sectionLetter = String.fromCharCode(65 + sectionIndex);
        sectionIndex++;

        checkNewPage(22);

        // Section header band
        doc.setFillColor(26, 26, 26);
        doc.roundedRect(margin - 5, y, contentWidth + 10, 13, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`SECTION ${sectionLetter} — ${title.toUpperCase()}`, margin, y + 9);
        y += 17;

        if (instruction) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(107, 114, 128);
          const instrLines = doc.splitTextToSize(instruction, contentWidth);
          doc.text(instrLines, margin, y);
          y += instrLines.length * 4.5 + 3;
        }

        // ── Questions ──────────────────────────────────────────────────────────
        for (let qi = 0; qi < questions.length; qi++) {
          const q = questions[qi];
          globalQuestionNum++;

          const qText = `${globalQuestionNum}. ${q.question}`;
          const qLines = doc.splitTextToSize(qText, contentWidth - 28);
          const optionLines = q.type === 'MCQ' && q.options ? q.options.length : 0;
          const answerLines =
            q.type === 'Descriptive' ? 5 : q.type === 'ShortAnswer' || q.type === 'FillBlanks' ? 2 : 0;
          const blockH = qLines.length * 5 + optionLines * 5 + answerLines * 5.5 + 14;

          checkNewPage(blockH);

          // Question box
          doc.setFillColor(249, 250, 251);
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin - 3, y, contentWidth + 6, blockH, 2, 2, 'FD');

          // Difficulty badge
          const diffColors: Record<string, [number, number, number]> = {
            easy: [21, 128, 61],
            medium: [146, 64, 14],
            hard: [153, 27, 27],
          };
          const [r, g, b] = diffColors[q.difficulty] || [107, 114, 128];
          doc.setFillColor(r, g, b);
          const diffLabel =
            q.difficulty === 'easy' ? 'Easy' : q.difficulty === 'hard' ? 'Hard' : 'Moderate';
          const badgeW = diffLabel.length * 1.6 + 4;
          doc.roundedRect(margin + 1, y + 2, badgeW, 5.5, 1, 1, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(255, 255, 255);
          doc.text(diffLabel, margin + 1 + badgeW / 2, y + 6, { align: 'center' });

          // Marks label
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(107, 114, 128);
          doc.text(`[${q.marks} Mk]`, pageWidth - margin, y + 6, { align: 'right' });

          // Question text
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(26, 26, 26);
          doc.text(qLines, margin + 1, y + 11);
          y += qLines.length * 5 + 9;

          // MCQ options
          if (q.type === 'MCQ' && q.options) {
            for (const opt of q.options) {
              const optL = doc.splitTextToSize(opt, contentWidth - 20);
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
              doc.setTextColor(55, 65, 81);
              doc.text(optL, margin + 8, y);
              y += optL.length * 4.8;
            }
            y += 2;
          }

          // True/False
          if (q.type === 'TrueFalse') {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(55, 65, 81);
            doc.text('(a) True          (b) False', margin + 8, y);
            y += 6;
          }

          // Answer lines for short/fill
          if (q.type === 'FillBlanks' || q.type === 'ShortAnswer') {
            doc.setDrawColor(156, 163, 175);
            doc.setLineWidth(0.3);
            doc.line(margin + 4, y + 2, pageWidth - margin - 4, y + 2);
            y += 7;
          }

          // Writing lines for descriptive
          if (q.type === 'Descriptive') {
            doc.setDrawColor(209, 213, 219);
            doc.setLineWidth(0.25);
            for (let l = 0; l < 4; l++) {
              doc.line(margin + 4, y + 2, pageWidth - margin - 4, y + 2);
              y += 5.5;
            }
          }

          y += 5;
        }

        y += 4;
      };

      renderSectionToPDF('Multiple Choice Questions', paper.mcqs || []);
      renderSectionToPDF('Short Answer Questions', paper.shortQuestions || []);
      renderSectionToPDF('Long Answer Questions', paper.longQuestions || []);

      // End of paper marker
      checkNewPage(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(26, 26, 26);
      doc.text('— End of Question Paper —', pageWidth / 2, y, { align: 'center' });
      y += 12;

      // ── Answer Key ────────────────────────────────────────────────────────────
      if (paper.answerKey && paper.answerKey.length > 0) {
        doc.addPage();
        y = margin;

        doc.setFillColor(26, 26, 26);
        doc.roundedRect(margin - 5, y - 5, contentWidth + 10, 14, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('ANSWER KEY', margin, y + 6);
        y += 20;

        paper.answerKey.forEach((ans, idx) => {
          if (!ans) return;
          checkNewPage(14);
          const ansLines = doc.splitTextToSize(ans, contentWidth - 6);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(55, 65, 81);
          doc.text(ansLines, margin, y);
          y += ansLines.length * 5 + 4;
        });
      }

      // ── Footer (all pages) ────────────────────────────────────────────────────
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(156, 163, 175);
        doc.text(
          'Generated by VedaAI — AI-powered Assessment Creator',
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 8, {
          align: 'right',
        });
      }

      doc.save(`${paper.title || 'exam-paper'}.pdf`);
    },
    []
  );

  return { exportToPDF };
}
