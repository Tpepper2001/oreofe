import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Document, Page, Text, View, StyleSheet, PDFViewer, Image as PDFImage, PDFDownloadLink
} from '@react-pdf/renderer';
import {
  LayoutDashboard, LogOut, Loader2, Plus, School, User, Download,
  X, Eye, Trash2, ShieldCheck, Save, Menu, Upload, Users, Key, Copy, UserPlus
} from 'lucide-react';

//', 'RESPONSIBILITY', 'EMPATHY', 'PUNCTUALITY', 'NEATNESS', 'INITIATIVE'
];
const RATINGS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

const isExamField = (str) => {
    if (!str) return false;
    const s = str.toLowerCase();
    return s.includes('exam') || s.includes('examination');
};

const calculateGrade = (obtained, maxPossible) => {
  if (!maxPossible || maxPossible === 0) return { grade: '-', remark: '-' };
  const percentage = (obtained / maxPossible) * 100;
  if (percentage >= 86) return { grade: 'A*', remark: 'Distinction' };
  if (percentage >= 76) return { grade: 'A', remark: 'Excellent' };
  if (percentage >= 66) return { grade: 'B', remark: ==================== SUPABASE CONFIG ====================
const supabaseUrl = 'https://xtciiatfetqecsfxoicq.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Y2lpYXRmZXRxZWNzZnhvaWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDEyMDIsImV4cCI6MjA4MDYxNzIwMn0.81K9w-XbCHWRWmKkq3rcJHxslx3hs5mGCSNIvyJRMuw'; 'Very Good' };
  if (percentage >= 60) return { grade: 'C', remark: 'Good' };
  if (percentage >= 50) return { grade: 'D', remark: 'Fairly Good' };
  if (percentage >= 40) return { grade: 'E', remark: 'Pass' };
  return { grade: 'F', remark: 'Fail' };
};

const generatePIN = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); 
    return `${year}/${random}`;
};

const imageUrlToBase64 = async (url) => {
    if (!url) return null;
    try {
        const response = await fetch(url + '?t=' + new Date().getTime());
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Image convert error:", e);
        return null;
    }
};

const useAutoSave = (callback, delay = 2000) => {
  const [saving, setSaving] = useState(false);
  const timeoutRef = useRef(null);
  const trigger = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeout 
const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== CONSTANTS & HELPERS ====================
const BEHAVIORAL_TRAITS = [
  'COOPERATION', 'LEADERSHIP', 'HONESTY', 'SELF DISCIPLINE',
  'RESPECT', 'RESPONSIBILITY', 'EMPATHY', 'PUNCTUALITY', 'NEATNESS', 'INITIATIVE'
];
const RATINGS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

const isExamField = (str) => {
    if (!str) return false;
    const s = str.toLowerCase();
    return s.includes('exam') || s.includes('examination');
};

const calculateGrade = (obtained, maxPossible) => {
  if (!maxPossible || maxPossible === 0) return { grade: '-', remark: '-' };
  const percentage = (obtained / maxPossible) * 100;
  if (percentage >= 86) return { grade: 'A*', remark: 'Distinction' };
  if (percentage >= 76) return { grade: 'A', remark: 'Excellent' };
  if (percentage >= 66) return { grade: 'B', remark: 'Very Good' };
  if (percentage >= 60) return { grade: 'C', remark: 'Good' };
  if (percentage >= 50) return { grade: 'D', remark: 'Fairly Good' };
  if (percentage >= 40) return { grade: 'E', remark: 'Pass' };
  return { grade: 'F', remark: 'Fail' };
};

const generatePIN = () => Math.floor(Ref.current = setTimeout(async () => {
      setSaving(true);
      await callback();
      setSaving(false);
    }, delay);
  }, [callback, delay]);
  return { save: trigger, saving };
};

// ==================== PDF STYLES ====================
const pdfStyles = StyleSheet100000 + Math.random() * 900000).toString();

const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 9, color: '#333' },
  watermarkContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: '000 + Math.random() * 9000); 
    return `${year}/${random}`;
};

const imageUrlToBase64 = async (url) => {
    if (!url) return null;
    try {
        const response = await fetch(url + '?t=' + new Date().getTime());
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader =center', zIndex: -1 },
  watermarkImage: { width: 400, height: 400, opacity: 0.05 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: '#0f172a', paddingBottom: 10 },
  logoBox: { width: 70, height: 70, marginRight: 15, justifyContent: 'center', alignItems: 'center' }, new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Image convert error:", e);
        return null;
    }
};

const useAutoSave = (callback, delay = 2000) => {
  const [saving, setSaving] = useState(false);

  logo: { width: '100%', height: '100%', objectFit: 'contain' },
  headerTextBox: { flex: 1 },
  schoolName: { fontSize: 22  const timeoutRef = useRef(null);
  const trigger = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
, fontFamily: 'Helvetica-Bold', color: '#0f172a', textTransform: 'uppercase', marginBottom: 4 },
  schoolAddress: { fontSize: 9, color: '#444', marginBottom: 2 },
  contactRow: { fontSize: 9, color: '#444', fontStyle: 'italic' },
  reportTitleBox: { alignItems: 'center', marginBottom: 15, paddingVertical: 6, backgroundColor: '#f1f5f9', borderRadius: 2 },
  reportTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: '#      setSaving(true);
      await callback();
      setSaving(false);
    }, delay);
  }, [callback, delay]);
  return { save: trigger, saving };
};

// ==================== PDF STYLES ====================
const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 9, color: '#333' },
  watermarkContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: -1 },
  watermarkImage: { width: 400, height: 400, opacity: 0.00f172a' },
  infoContainer: { marginBottom: 15, border: '1pt solid #e2e8f0', borderRadius: 4 },
  infoRow: { flexDirection: 'row', borderBottom: '1pt solid #f1f5f9', padding: 6 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  table: { width: '100%', marginBottom: 15, border: '1pt solid #e2e8f0' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#0f15 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: '#0f172a', paddingBottom: 10 },
  logoBox: { width: 70, height: 70, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  logo: { width: '100%', height: '100%', objectFit: 'contain' },
  headerTextBox: { flex: 1 },
  schoolName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0f172a', textTransform: 'uppercase', marginBottom: 4 },
  schoolAddress: { fontSize: 9, color: '#444', marginBottom: 2 },
  contactRow: { fontSize72a', paddingVertical: 6, alignItems: 'center' },
  headerText: { color: 'white', fontSize: 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row: 9, color: '#444', fontStyle: 'italic' },
  reportTitleBox:', borderBottom: '1pt solid #e2e8f0', minHeight: 22, alignItems: 'center' },
  cell: { padding: 4, fontSize: 9 },
  colSN: { width: '6%', textAlign: 'center' }, 
  colSubject: { width: '30%' }, 
  colTotal: { width: '10%', fontFamily: 'Helvetica-Bold', textAlign { alignItems: 'center', marginBottom: 15, paddingVertical: 6, backgroundColor: '#f1f5f9', borderRadius: 2 },
  reportTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: '#0f172a' },
  infoContainer: { marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 },
  infoRow: { flexDirection: 'row', borderBottomWidth: 1, border: 'center' }, 
  colGrade: { width: '10%', textAlign: 'center' },
  colRemark: { width: '15%', textAlign: 'left', fontSize: 8 },
  footerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  signatureBox: { width: '40%', alignItems: 'center', paddingTop: 5, borderTop: '1pt solid #94a3b8', height: 60, justifyContent: 'flex-end' },
  signatureImage: { height: 40, width: 100, objectFit: 'contain', marginBottom: 2 },
  signatureText: { fontSize: 8, color: '#647BottomColor: '#f1f5f9', padding: 6 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  table: { width: '100%', marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#0f172a', paddingVertical: 6, alignItems: 'center' },
  headerText: { color: 'white', fontSize48b', textTransform: 'uppercase' }
});

const ResultPDF = ({ school, student, results, classInfo, comments, behaviors = [], reportType = 'full', logoBase64, principalSigBase64, teacherSigBase64 }) => {
  const isMidTerm = reportType === 'mid';
  const config = school.assessment_config || [];
  const displayFields = isMidTerm ? config.filter(f => !isExamField(f.code) && !isExamField(f.name)) : config;
  const maxPossibleScore = displayFields.reduce((sum, f) => sum + parseInt(f.max), 0);
  const fixedWidths = 6 + 30 + 10 + : 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', minHeight: 22, alignItems: 'center' },
  cell: { padding: 4, fontSize: 9 },
  colSN: { width: '6%', textAlign: 'center' }, 
  colSubject: { width: '30%' }, 
  colTotal: { width: '10%', fontFamily: 'Helvetica-Bold', textAlign: 'center' }, 
  colGrade: { width: '10%', textAlign: 'center' },
  colRemark: { width: '15%', textAlign: 'left', fontSize: 8 },
  10 + 15; 
  const remainingWidth = 100 - fixedWidths;
  const scoreColWidth = displayFields.length > 0 ? `${remainingWidth / displayFields.length}%` : '0%';
  const processedResults = results.map(r => {
    const rawScores = r.scores || {};
    let total = 0;
    displayFields.forEach(f => total += (parseFloat(rawScores[f.code]) || 0));
    const { grade, remark } = calculateGrade(total, maxPossibleScore);
    return { ...r, scores: rawScores, total, grade, remarkfooterContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  signatureBox: { width: '40%', alignItems: 'center', paddingTop: 5, borderTopWidth: 1, borderTopColor: '#94a3b8', height: 60, justifyContent: 'flex-end' },
  signatureImage: { height: 40, width: 100, objectFit: 'contain', marginBottom: 2 },
  signatureText: { fontSize: 8, color: '#64748b', textTransform: 'uppercase' }
});

const ResultPDF = ({ school };
  });
  const totalScore = processedResults.reduce((acc, r) => acc + r.total, 0);
  const average = ((totalScore / (results.length * maxPossibleScore)) * 100).toFixed(1);
  const behaviorMap = Object.fromEntries(behaviors.map(b => [b.trait, b.rating]));
  const teacherComment = isMidTerm ? (comments?.midterm_tutor_comment || "No mid-term comment.") : (comments?.tutor_comment || "No comment.");

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {logoBase64 && <View style={pdfStyles.watermarkContainer}><PDFImage src={logoBase64} style={pdfStyles.watermarkImage} /></View>}
        <View style={pdfStyles.headerContainer}>
          <View style={pdfStyles.logoBox}>{logo, student, results, classInfo, comments, behaviors = [], reportType = 'full', logoBase64, principalSigBase64, teacherSigBase64 }) => {
  const isMidTerm = reportType === 'mid';
  const config = school.assessment_config || [];
  const displayFields = isMidTerm ? config.filter(f => !isExamField(f.code) && !isExamField(f.name)) : config;
  const maxPossibleScore = displayFields.reduce((sum, f) => sum + parseInt(f.max), 0);
  const fixedWidths = 6 + 30 + 10 + 10 + 15; 
  const remainingWidth = 100 - fixedWidths;
  const scoreColWidth = displayFields.length > 0 ? `${remainingWidth / displayFieldsBase64 ? <PDFImage src={logoBase64} style={pdfStyles.logo} /> : null}</View>
          <View style={pdfStyles.headerTextBox}>
            <Text style={pdfStyles.schoolName}>{school?.name || 'SCHOOL NAME'}</Text>
            {school?.address && <Text style={pdfStyles.schoolAddress}>{school.address}</Text>}
            <Text style={pdfStyles.contactRow.length}%` : '0%';
  const processedResults = results.map(r => {
    const rawScores = r.scores || {};
    let total = 0;
    displayFields.forEach(f => total += (parseFloat(rawScores[f.code]) || 0));
    const { grade, remark } = calculateGrade(total, maxPossibleScore);
    return { ...r, scores: rawScores, total}>{school?.email || ''} {school?.email && school?.contact ? '|' : ''} {school?.contact || ''}</Text>
          </View>
        </View>
        <View style={pdfStyles.reportTitleBox}>
            <Text style={pdfStyles.reportTitle}>{isMidTerm ? 'MID-TERM CONTINUOUS ASSESSMENT' : 'END OF TERM REPORT'} - {school?.current_term?.toUpperCase()}</Text, grade, remark };
  });
  const totalScore = processedResults.reduce((acc, r) => acc + r.total, 0);
  const average = ((totalScore / (results.length * maxPossibleScore)) * 100).toFixed(1);
  const behaviorMap = Object.fromEntries(behaviors.map(b => [b.trait, b.rating]));
  const teacherComment = isMidTerm ? (comments?.midterm_tutor_comment || "No mid-term comment.") : (comments?.>
            <Text style={{fontSize: 9, color: '#64748b', marginTop: 2}}>{school?.current_session} SESSION</Text>
        </View>
        <View style={pdfStyles.infoContainer}>
            <View style={pdfStyles.infoRow}>
                <View style={pdfStyles.infoCol}><Text style={pdfStyles.infoLabel}>Student Name</Text><Text style={pdfStyles.infoValue}>{student.name}</Text></View>
                <View style={pdfStyles.infoCol}><Text style={pdfStyles.infoLabel}>Admission No</Text><Text style={pdfStyles.infoValue}>{student.admission_no}</Text></View>
                <View style={pdfStyles.infoColtutor_comment || "No comment.");

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {logoBase64 && <View style={pdfStyles.watermarkContainer}><PDFImage src={logoBase64} style={pdfStyles.watermarkImage} /></View>}
        <View style={pdfStyles.headerContainer}>
          <View style={pdfStyles.logoBox}>{logoBase64 ? <PDFImage src={logoBase64} style={pdfStyles.logo} /> : null}</View>
          <View style={pdfStyles.headerTextBox}>
            <Text style}><Text style={pdfStyles.infoLabel}>Class</Text><Text style={pdfStyles.infoValue}>{classInfo?.name}</Text></View>
            </View>
            <View style={[pdfStyles.infoRow, {borderBottom: 0}]}>
                <View style={pdfStyles.infoCol}><Text style={pdfStyles.infoLabel}>Gender</Text><Text style={pdfStyles.infoValue}>{student.gender}</Text></View>
                <View style={pdfStyles.infoCol}><Text style={pdfStyles.={pdfStyles.schoolName}>{school?.name || 'SCHOOL NAME'}</Text>
            {school?.address && <Text style={pdfStyles.schoolAddress}>{school.address}</Text>}
            <Text style={pdfStyles.contactRow}>{school?.email || ''} {school?.email && school?.contact ? '|' : ''} {school?.contact || ''}</Text>
          </View>
        </View>
        <View style={pdfStyles.reportTitleBox}>
            <Text style={pdfStyles.reportTitle}>{isMidTerminfoLabel}>Total Obtained</Text><Text style={pdfStyles.infoValue}>{totalScore} / {results.length * maxPossibleScore}</Text></View>
                <View style={pdfStyles.infoCol}><Text style={pdfStyles.infoLabel}>Percentage</Text><Text style={pdfStyles.infoValue}>{isNaN(average) ? '0.0' : average}%</Text></View>
            </View>
        </View ? 'MID-TERM' : 'END OF TERM REPORT'} - {school?.current_term?.toUpperCase()}</Text>
            <Text style={{fontSize: 9, color: '#64748b', marginTop: 2}}>{school?.current_session} SESSION</Text>
        </View>
        <View style={pdfStyles.infoContainer}>
            <View style={pdfStyles.infoRow}>
                <View style={>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.cell, pdfStyles.colSN, pdfStyles.headerText]}>S/N</Text>
            <Text style={[pdfStyles.cell, pdfStyles.colSubject, pdfStyles.headerText]}>SUBJECT</Text>
            {displayFields.map(f => <Text key={f.code} style={[pdfStyles.cell, {width: scoreColWidth, textAlign: 'center'}, pdfpdfStyles.infoCol}><Text style={pdfStyles.infoLabel}>Student Name</Text><Text style={pdfStyles.infoValue}>{student.name}</Text></View>
                <View style={pdfStyles.infoCol}><Text style={pdfStyles.infoLabel}>Admission No</Text><Text style={pdfStyles.infoValue}>{student.admission_no}</Text></View>
                <View style={pdfStyles.infoCol}><Text style={pdfStyles.infoLabel}>Class</Text><Text style={pdfStyles.infoValue}>{classStyles.headerText]}>{f.name.toUpperCase()}</Text>)}
            <Text style={[pdfStyles.cell, pdfStyles.colTotal, pdfStyles.headerText]}>TOT</Text>
            <Text style={[pdfStyles.cell, pdfStyles.colGrade, pdfStyles.headerText]}>GRD</Text>
            <Text style={[pdfStyles.cell, pdfStyles.colRemark, pdfStyles.headerText]Info?.name}</Text></View>
            </View>
        </View>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.cell, pdfStyles.colSN, pdfStyles.headerText]}>S/N</Text>
            <Text style={[pdfStyles.cell, pdfStyles.colSubject, pdfStyles.headerText]}>SUBJECT</Text>}>REMARK</Text>
          </View>
          {processedResults.map((r, i) => (
            <View key={i} style={[pdfStyles.tableRow, { backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }]}>
              <Text style={[pdfStyles.cell, pdfStyles.colSN]}>{i + 1}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.colSubject]}>{r.subjects?.name}</Text>
              {displayFields.map(f => <Text key={f.code} style={[pdfStyles.cell, {width: scoreColWidth, textAlign: 'center'}]}>{r.scores[f.code] || 0}</Text>
            {displayFields.map(f => <Text key={f.code} style={[pdfStyles.cell, {width: scoreColWidth, textAlign: 'center'}, pdfStyles.headerText]}>{f.name.toUpperCase()}</Text>)}
            <Text style={[pdfStyles.cell, pdfStyles.colTotal, pdfStyles.headerText]}>TOT</Text>
            <Text style={[pdfStyles.cell, pdfStyles.colGrade, pdfStyles.headerText]}>GRD</Text>
            <Text style={[pdfStyles.cell, pdfStyles.colRemark, pdfStyles.headerText]}>REMARK</Text>
          </View>
          {processedResults.map((r, i) => (
            <View key={i} style)}
              <Text style={[pdfStyles.cell, pdfStyles.colTotal]}>{r.total}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.colGrade]}>{r.grade}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.colRemark]}>{r.remark}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 15 }}>
            <View style={{ flex: 1, border: '1pt solid={[pdfStyles.tableRow, { backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }]}>
              <Text style={[pdfStyles.cell, pdfStyles.colSN]}>{i + 1}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.colSubject]}>{r.subjects?.name}</Text>
              {displayFields.map(f => <Text key={f.code} style={[pdfStyles.cell, {width: scoreColWidth, textAlign: 'center'}]}>{ #e2e8f0', padding: 8 }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>BEHAVIOURAL TRAITS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {BEHAVIORAL_TRAITS.map(t => (<View key={t} style={{ width: '50%', marginBottom: 3 }}><Text style={{ fontSize: 7, color: '#64748b' }}>{t}</r.scores[f.code] || 0}</Text>)}
              <Text style={[pdfStyles.cell, pdfStyles.colTotal]}>{r.total}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.colGrade]}>{r.grade}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.colRemark]}>{r.remark}</Text>
            </View>
          ))}
        </ViewText><Text style={{ fontSize: 8 }}>{behaviorMap[t] || 'Good'}</Text></View>))}
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ marginBottom: 10, border: '1pt solid #e2e8f0', padding: 8 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>CLASS TUTOR'S REMARK</Text>
                    <Text style={{ fontSize: 8, fontStyle>
        <View style={{ flexDirection: 'row', gap: 15 }}>
            <View style={{ flex: 1, borderWidth: 1, borderColor: '#e2e8f0', padding: 8 }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>BEHAVIOURAL TRAITS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {BEHAVIORAL_TRAITS.map(t => (<View key={t}: 'italic', marginTop: 3 }}>{teacherComment}</Text>
                </View>
                {!isMidTerm && (
                <View style={{ border: '1pt solid #e2e8f0', padding: 8 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}> style={{ width: '50%', marginBottom: 3 }}><Text style={{ fontSize: 7, color: '#64748b' }}>{t}</Text><Text style={{ fontSize: 8 }}>{behaviorPRINCIPAL'S REMARK</Text>
                    <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 3 }}>{comments?.principal_comment || 'Result Verified and Approved.'}</Text>
                </View>
                )}
            </View>
        </View>
        <View style={pdfStyles.footerContainer}>
            <View style={pdfStyles.signatureBox}>
                {teacherSigBase6Map[t] || 'Good'}</Text></View>))}
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', padding: 8 }}>
                    <Text style4 ? <PDFImage src={teacherSigBase64} style={pdfStyles.signatureImage} /> : null}
                <Text style={pdfStyles.signatureText}>Class Tutor Signature</Text>
            </View>
            {!isMidTerm && (
            <View style={pdfStyles.signatureBox}>
                {principalSigBase64 ? <PDFImage src={principalSigBase64} style={pdfStyles.signatureImage} /> : null}
                <Text style={pdfStyles.signatureText}>Principal Signature</Text>
            </View>
            )}
        </View>
      </Page>
    </Document>
  );
};

// ==================== SCHOOL ADMIN COMPONENT ====================
const SchoolAdmin = ({ profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [school, set={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>CLASS TUTOR'S REMARK</Text>
                    <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 3 }}>{teacherComment}</Text>
                </View>
            </View>
        </View>
        <View style={pdfStyles.footerContainer}>
            <View style={pdfStyles.signatureBox}>
                {teacherSigBase64 ? <PDFImage src={teacherSigBase64} style={pdfStyles.signatureImage} /> : null}
                <Text style={pdfStyles.signatureText}>Class Tutor Signature</Text>
            </View>
            {!isMidTerm && (
            <View style={pdfStyles.signatureBox}>
                {principalSigBase64 ? <PDFImage src={principalSigBase64} style={pdfStyles.signatureImage} /> : null}
                <Text style={pdfStyles.signatureText}>Principal Signature</Text>
            </View>
            )}
        </View>
      </Page>
    </Document>
  );School] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [reportType, setReportType] = useState('full');
  const [previewData, setPreviewData] = useState(null);
  
};

// ==================== SCHOOL ADMIN COMPONENT ====================
const SchoolAdmin = ({ profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newConfig, setNewConfig] = useState({ name: '', max: 10, code: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetchSchoolData(); }, [profile]);

  const fetchSchoolData = async () => {
    setLoading(true);const [viewingStudent, setViewingStudent] = useState(null);
  const [reportType, setReportType] = useState('full');
  const [previewData, setPreviewData] = useState(null);
  const [newConfig, setNewConfig] = useState({ name: '', max: 10, code: ''
    const { data: s } = await supabase.from('schools').select('*').eq('owner_id', profile.id).single();
    if(!s && profile.school_id) {
       const { data: subS } = await supabase.from('schools').select('*').eq('id', profile.school_id).single();
       setSchool(subS);
       if(subS) await loadRelated(subS.id);
    } else {
       setSchool(s);
       if(s) await loadRelated(s.id);
    }
    setLoading(false);
  };

  const loadRelated });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetchSchoolData(); }, [profile]);

  const fetchSchoolData = async () => {
    setLoading(true);
    const { data: s } = await supabase.from('schools').select('*').eq('owner_id', profile.id).single();
    if(!s && profile.school_id) {
       const { data: subS } = await supabase.from('schools').select('*').eq('id', profile.school_id).single();
       setSchool(subS);
       if(subS) await loadRelated( = async (schoolId) => {
      const { data: cls } = await supabase.from('classes').select('*, profiles(full_name)').eq('school_id', schoolId);
      setClasses(cls || []);
      const { data: stu } = await supabase.from('students').select('*, classes(name, form_tutor_id, profiles(signature_url)), comments(submission_status)').eq('school_id', schoolId).order('name');
      setStudents(stu || []);
      const { data: tchsubS.id);
    } else {
       setSchool(s);
       if(s) await loadRelated(s.id);
    }
    setLoading(false);
  };

  const loadRelated = async (schoolId) => {
      const { data: cls } = await supabase.from('classes').select('*, profiles(full_name)').eq('school_id', schoolId);
      setClasses(cls || []);
      const { data: stu } = await supabase.from('students').select('*, classes( } = await supabase.from('profiles').select('*').eq('school_id', schoolId).eq('role', 'teacher');
      setTeachers(tch || []);
      const { data: adm } = await supabase.from('profiles').select('*').eq('school_id', schoolId).eq('role', 'admin');
      setAdmins(adm || []);
  };

  // Define inviteAdmin INSIDE SchoolAdmin component
  const inviteAdmin = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const email = fd.get('email');
      const name = fd.get('name');
      const code = Math.floor(100000 + Math.random() * 900name, form_tutor_id, profiles(signature_url)), comments(submission_status)').eq('school_id', schoolId).order('name');
      setStudents(stu || []);
      const { data: tch } = await supabase.from('profiles').select('*').eq('school_id', schoolId).eq('role', 'teacher');
      setTeachers(tch || []);
      const { data: adm } = await supabase.from('profiles').select('*').eq('school_id', schoolId).eq('role', 'admin');
      setAdmins(adm || []);
  };

  // FIXED: RESTORED inviteAdmin FUNCTION
  const inviteAdmin = async (e) => {
    e.preventDefault();
    const fd = new FormData(000).toString();
      const currentInvites = school.admin_invites || [];
      const newInvite = { email, name, code, created_at: new Date().toISOString() };
      const updatedInvites = [...currentInvites, newInvite];
      const { error } = await supabase.from('schools').update({ admin_invites: updatedInvites }).eq('id', school.id);
      if(!error) {
          window.alert(`Invite Created! Code: ${code}\nShare this code with the user.`);e.target);
    const email = fd.get('email');
    const name = fd.get('name');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const currentInvites = school.admin_invites || [];
    const newInvite = { email, name, code, created_at: new Date().toISOString() };
    const updatedInvites = [...currentInvites, newInvite];

    const { error } = await supabase.from('schools').update({ admin_invites: updatedInvites }).eq('id', school.id);
    if(!error) {
        window.alert(`Invite Created! Code: ${code}`);
        e.target.reset();
        fetchSchoolData();
    } else {
        window.alert("Error: " + error.message);
    }
  };

  const updateSchool = async (e) => {
    e.preventDefault
          e.target.reset();
          fetchSchoolData();
      } else {
          window.alert("Error: " + error.message);
      }
  };

  const updateSchool = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const file = formData.get('logo_file');
    let logo_url = school.logo_url;
    if (file && file.size > 0) {
        const fileName();
    setLoading(true);
    const formData = new FormData(e.target);
    const updates = {
        name: formData.get('name'), address: formData.get('address'),
        contact: formData.get('contact'), email: formData.get('email'),
        current_term: formData.get('current_term'), current_session: formData.get('current_session')
    };
    await supabase.from('schools = `logo-${school.id}-${Date.now()}.${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('school-assets').upload(fileName, file);
        if (!error) {
            const { data } = supabase.storage.from('school-assets').getPublicUrl(fileName);
            logo_url = data.publicUrl;
        }
    }
    ').update(updates).eq('id', school.id);
    setSchool(prev => ({ ...prev, ...updates }));
    window.alert('School Info Updated!');
    setLoading(false);
  };

  const addConfigField = async () => {
    if(!newConfig.name || !newConfig.max) return;
    const code = newConfig.name.toLowerCase().replace(/[^a-z0-9const updates = {
        name: formData.get('name'), address: formData.get('address'),
        contact: formData.get('contact'), email: formData.get('email'),
        current_term: formData.get('current_term'), current_session: formData.get('current_session'),
        logo_url
    };
    await supabase.from('schools').update(updates).eq('id', school.id);
]/g, '_');
    const updated = [...(school.assessment_config || []), { ...newConfig, code }];
    await supabase.from('schools').update({ assessment_config: updated }).eq('id', school.id);
    setNewConfig({ name: '', max: 10, code: '' });
    fetchSchoolData();
  };

  const loadStudentResult = async (student, type) => {
        setSchool(prev => ({ ...prev, ...updates }));
    window.alert('School Info Updated!');
    setLoading(false);
  };

  const addConfigField = async () => {
    if(!newConfig.name || !newConfig.max) return;
    const code = newConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const updated = [...(school.setViewingStudent(student);
    setReportType(type);
    const { data: results } = await supabase.from('results').select('*, subjects(*)').eq('student_id', student.id);
    const { data: comments } = await supabase.from('comments').select('*').eq('student_id', student.id).maybeSingle();
    const logoBase64 = await imageUrlToBase64(school.logo_url);
    const principalSigBase64 = await imageUrlToBase64(school.principal_signature_url);
    const teacherSigBase64 = await imageUrlToBase64(student.classes?.profiles?.signature_url);

    setPreviewData({ 
        school, student, classInfo: student.classes, 
        results: results || [], comments: comments || {}, behaviors: [], 
        logoBase64, principalSigassessment_config || []), { ...newConfig, code }];
    await supabase.from('schools').update({ assessment_config: updated }).eq('id', school.id);
    setNewConfig({ name: '', max: 10, code: '' });
    fetchSchoolData();
  };

  const loadStudentResult = async (student, type) => {
    setViewingStudent(student);
    setReportType(type);
    const { data: results } = await supabase.from('results').select('*, subjects(*)').eq('student_id', student.id);
    const { data: comments } = await supabase.from('comments').select('*').eq('student_id', student.id).maybeSingle();
    const behaviorList = comments?.behaviors ? JSON.parse(comments.behaviors) : {};
    const behaviorArray = BEHAVIORALBase64, teacherSigBase64 
    });
  };

  if (viewingStudent && previewData) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-100 h-screen w-screen">
            <div className="bg-white p-4 shadow flex justify-between items-center">
                <button onClick={() => setViewingStudent(null_TRAITS.map(trait => ({ trait, rating: behaviorList[trait] || 'Good' }));
    const logoBase64 = await imageUrlToBase64(school.logo_url);
    const principalSigBase64 = await imageUrlToBase64(school.principal_signature_url);
    const teacherSigBase64 = await imageUrlToBase64(student.classes?.profiles?.signature_url);

    setPreviewData({ 
        school, student, classInfo: student.classes, 
        results: results || [], comments)} className="flex items-center gap-2"><X /> Close</button>
                <div className="flex gap-3">
                    <PDFDownloadLink document={<ResultPDF {...previewData} reportType={reportType} logoBase64={previewData.logoBase64} principalSigBase64={previewData.principalSigBase64} teacherSigBase64={previewData.teacherSigBase64} />} fileName={`${viewingStudent.name}.pdf`}>
                      <button className="bg-blue-600 text-white px-3 py-2 rounded flex items: comments || {}, behaviors: behaviorArray, 
        logoBase64, principalSigBase64, teacherSigBase64 
    });
  };

  if (viewingStudent && previewData) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-100 h-screen w-screen">
            <div className="bg-white p-4 shadow-center gap-2 text-sm"><Download size={16} /> PDF</button>
                    </PDFDownloadLink>
                </div>
            </div>
            <PDFViewer className="flex-1 w-full"><ResultPDF {...previewData} reportType={reportType} logoBase64={previewData.logoBase64} principalSigBase64={previewData.principalSigBase64} teacherSigBase64={previewData.teacher flex justify-between items-center z-10">
                <button onClick={() => setViewingStudent(null)} className="flex items-center gap-2"><X /> Close</button>
                <div className="flex gap-3">
                    <PDFDownloadLink document={<ResultPDF {...previewData} reportType={reportType} logoBase64={previewData.logoBase64} principalSigBase64={previewData.principalSigSigBase64} /></PDFViewer>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans flex-col md:flex-row">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-10 inset-yBase64} teacherSigBase64={previewData.teacherSigBase64} />} fileName={`${viewingStudent.name}.pdf`}>
                      <button className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm font-bold"><Download size={16} /> PDF</button>
                    </PDFDownloadLink>
                </div>
            </div>
            <div className="flex-1 w-full relative">
                 <PDFViewer className="absolute inset-0 w-full-0 left-0 w-64 bg-slate-900 text-white flex flex-col p-4 transition duration-200`}>
        <div className="flex items-center gap-2 font-bold text-xl mb-8"><School /> Admin Panel</div>
        <nav className="space-y-2 flex-1">
          {['dashboard', 'info', 'admins', 'students', 'classes'].map(t => (
              <button key={t} onClick={()=>setActiveTab(t)} className={`w-full text-left p-3 rounded capitalize flex gap-2 ${activeTab===t?'bg-blue-600':''}`}>
                  {t === 'dashboard' ? <LayoutDashboard size={18}/> : t==='admins h-full"><ResultPDF {...previewData} reportType={reportType} logoBase64={previewData.logoBase64} principalSigBase64={previewData.principalSigBase64} teacherSigBase64={previewData.teacherSigBase64} /></PDFViewer>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans flex-col md:flex-row">
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-20 sticky top-0">
          <h2 className="font-bold flex items-center gap-2"><School size={20}/> Admin</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}><' ? <Key size={18}/> : t==='students'?<User size={18}/> : <Menu size={18}/>} {t}
              </button>
          ))}
        </nav>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-400 mt-auto"><LogOut size={18}/> Logout</button>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'Menu /></button>
      </div>
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-10 inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col p-4 transition duration-200 ease-in-out`}>
        <div className="hidden md:flexdashboard' && (
           <div>
               <h1 className="text-xl md:text-2xl font-bold mb-6 text-slate-800">Welcome, {school?.name}</h1>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded shadow"><h3>Students</h3><p className="text-3xl font-bold">{ items-center gap-2 font-bold text-xl mb-8"><School /> Admin Panel</div>
        <nav className="space-y-2 flex-1 mt-4 md:mt-0">
          {['dashboard', 'info', 'admins', 'students', 'classes'].map(t => (
              <button key={t} onClick={()=>{setActiveTab(t); setSidebarOpen(false);}} className={`w-full textstudents.length}</p></div>
                   <div className="bg-white p-6 rounded shadow"><h3>Teachers</h3><p className="text-3xl font-bold">{teachers.length}</p></div>
                   <div className="bg-white p-6 rounded shadow"><h3>Admins</h3><p className="text-3xl font-bold">{admins.length}</p></div>
               </div>
           </div>
        )}

        {activeTab-left p-3 rounded capitalize flex gap-2 ${activeTab===t?'bg-blue-600':''}`}>
                  {t === 'dashboard' ? <LayoutDashboard size={18}/> : t==='admins' ? <Key size={18}/> : t==='students'?<User size={18}/> : <Menu size={18}/>} {t}
              </button>
          ))}
        </nav> === 'admins' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Manage Admins</h2>
                    <form onSubmit={inviteAdmin} className="space-y-4">
                        <input name="name" placeholder="Admin Name" className="
        <button onClick={onLogout} className="flex items-center gap-2 text-red-400 mt-auto mb-4 md:mb-0"><LogOut size={18}/> Logout</button>
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
           <div>
               <h1 className="text-xl md:text-2xl font-bold mb-6 text-slate-800">Welcome,w-full p-2 border rounded" required />
                        <input name="email" type="email" placeholder="Admin Email" className="w-full p-2 border rounded" required />
                        <button className="bg-blue-600 text-white w-full py-2 rounded font-bold">Generate Code</button>
                    </form>
                    <div className="mt-8">
                        <h3 className="font-bold border-b pb-2 mb-2">Pending Invites</h3>
                        {(school?.admin_invites || []).map((inv, i) => (
                             <div key={i} className="flex justify-between items {school?.name}</h1>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500"><h3>Students</h3><p className="text-3xl font-bold text-slate-700">{students.length}</p></div>
                   <div className="bg-white p-6 rounded shadow border-l-4 border-green-500"><h3>Teachers</h3><p className="text-3xl font-bold text-slate-700">{teachers.length}</p></div>
                   <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">-center bg-yellow-50 p-2 mb-2 rounded border">
                                 <div><p className="text-xs font-bold">{inv.name}</p></div>
                                 <p className="text-lg font-mono font-bold text-blue-600">{inv.code}</p>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold<h3>Admins</h3><p className="text-3xl font-bold text-slate-700">{admins.length}</p></div>
               </div>
           </div>
        )}
        {activeTab === 'admins' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Manage Admins</h2>
                    <form onSubmit={inviteAdmin} className=" mb-4">School Details</h2>
                    <form onSubmit={updateSchool} className="space-y-4">
                        <input name="name" defaultValue={school?.name} className="w-full p-2 border rounded" />
                        <input name="address" defaultValue={school?.address} className="w-full p-2 border rounded" />
                        <div className="grid grid-cols-2 gap-4">
                             <input namespace-y-4">
                        <input name="name" placeholder="Name" className="w-full p-2 border rounded" required />
                        <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" required />
                        <button className="bg-blue-600 text-white w-full py-2 rounded font-bold">Generate Code</button>
                    </form="current_term" defaultValue={school?.current_term} className="w-full p-2 border rounded" />
                             <input name="current_session" defaultValue={school?.current_session} className="w-full p-2 border rounded" />
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Save Changes</button>
                    </form>
                </div>
>
                    <div className="mt-8">
                        <h3 className="font-bold border-b pb-2 mb-2">Pending Invites</h3>
                        {(school?.admin_invites || []).map((inv, i) => (
                             <div key={i} className="flex justify-between items-center bg-yellow-50 p-2 mb-2 rounded border">
                                 <div><p className="text-xs font-bold">{inv.name}</p><p className="text-xs">{inv.email}</p                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Assessment Config</h2>
                    {(school?.assessment_config || []).map(c => (
                        <div key={c.code} className="flex justify-between bg-gray-50 p-2 mb-2 border rounded">
                            <span>{c.name} ({c.max})</span>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <input placeholder="Title" className></div>
                                 <p className="text-lg font-mono font-bold text-blue-600">{inv.code}</p>
                             </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-bold mb-4">Current Admins</h3>
                    {admins.map(a => (<div key={a.id} className="p-2 border-b flex justify-between"><span>{a.full_name}</span><User size={="border p-2 rounded flex-1" value={newConfig.name} onChange={e=>setNewConfig({...newConfig, name:e.target.value})} />
                        <input placeholder="Max" type="number" className="border p-2 rounded w-16" value={newConfig.max} onChange={e=>setNewConfig({...newConfig, max:parseInt(e.target.value)})} />
                        <button onClick={addConfigField} className="bg-green-600 text-white px-3 rounded">Add</button>14}/></div>))}
                </div>
            </div>
        )}
        {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow">
                    <div className="bg-blue-50 p-4 rounded mb-6 border border-blue-200">
                        <h3 className="text-xs font-bold text-blue-800 uppercase">School ID (For Teachers)</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <code className="bg
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'students' && (
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 border-b">
                        <tr><th className="p-3">Name</th><th className="p-3">Adm No</th><th className="p-3">Class</th><th className="p-3">Status</th><th className="p-3">Action</th></tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            -white px-2 py-1 rounded border font-mono font-bold flex-1">{school?.id}</code>
                            <button onClick={() => {navigator.clipboard.writeText(school.id); alert('Copied!');}} className="bg-blue-600 text-white p-2 rounded"><Copy size={16}/></button>
                        </div>
                    </div>
                    <form onSubmit={updateSchool} className="space-y-4">
                        <input name="name" defaultValue={school?.name} placeholder="School Name" className="w-full p-2 border rounded" />
                        <input name="address" defaultValue={school?.address}<tr key={s.id} className="border-b">
                                <td className="p-3">{s.name}</td>
                                <td className="p-3 font-mono">{s.admission_no}</td>
                                <td className="p-3">{s.classes?.name}</td>
                                <td className="p-3">{s.comments?.[0]?.submission_status || 'draft'}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => loadStudentResult(s, ' placeholder="Address" className="w-full p-2 border rounded" />
                        <div className="grid grid-cols-2 gap-4">
                            <input name="current_term" defaultValue={school?.current_term} placeholder="Term" className="w-full p-2 border rounded" />
                            <input name="current_session" defaultValue={school?.current_session} placeholder="Session" className="w-full p-2 border rounded" />
                        </div>
                        <input type="file" name="logo_file" className="textfull')} className="text-blue-600"><Eye size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'classes' && (
            <div className="bg-white p-6 rounded shadow max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Classes</h2>
                <form onSubmit={-xs" />
                        <button className="bg-blue-600 text-white w-full py-2 rounded font-bold">Save Changes</button>
                    </form>
                </div>
                <div className="bg-white p-6 rounded shadow h-fit">
                    <h3 className="font-bold mb-4">Assessment Config</h3>
                    <div className="space-y-2 mb-4">
                        async(e)=>{
                    e.preventDefault(); const fd=new FormData(e.target);
                    await supabase.from('classes').insert({school_id:school.id, name:fd.get('name'), form_tutor_id:fd.get('tid')||null});
                    e.target.reset(); fetchSchoolData();
                }} className="flex gap-2 mb-6">
                    <input name="name"{(school?.assessment_config || []).map(c => (
                            <div key={c.code} className="flex justify-between bg-gray-50 p-2 rounded border text-sm">
                                <span>{c.name} ({c.max})</span>
                                <button onClick={async()=>{
                                    const filtered = school.assessment_config.filter(x => x.code !== c.code);
                                    await placeholder="Class Name" className="border p-2 rounded flex-1" required />
                    <select name="tid" className="border p-2 rounded flex-1">
                        <option value="">Select Tutor</option>
                        {teachers.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                    <button className="bg-blue-600 text-white px-4 rounded">Create</button>
                </form>
                <div className=" supabase.from('schools').update({ assessment_config: filtered }).eq('id', school.id);
                                    fetchSchoolData();
                                }} className="text-red-500"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input placeholder="Title" className="border p-1 rounded flex-1 text-sm" value={newConfig.name} onChange={e=>setNewConfig({...newConfig, name:e.target.value})}grid grid-cols-2 gap-4">
                    {classes.map(c=>(
                        <div key={c.id} className="border p-3 rounded bg-gray-50 flex justify-between">
                            <div><p className="font-bold">{c.name}</p><p className="text-xs">{c.profiles?.full_name || 'No Tutor'}</p></div>
                            <button onClick={async()=>{if(window.confirm('Del?')){await supabase.from('classes').delete().eq('id',c.id); fetchSchoolData();}}}><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// ==================== TEACHER DASHBOARD ==================== />
                        <input placeholder="Max" type="number" className="border p-1 rounded w-16 text-sm" value={newConfig.max} onChange={e=>setNewConfig({...newConfig, max:parseInt(e.target.value)})} />
                        <button onClick={addConfigField} className="bg-green-600 text-white px-2 rounded text-xs font-bold">Add</button>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'students' && (
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 border-b">
const TeacherDashboard = ({ profile, onLogout }) => {
  const [classes, setClasses] = useState([]);
  const [curClass, setCurClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scores, setScores] = useState({});
  const [behaviors, setBehaviors] = useState({});
  const [comments, setComments] = useState({ full
                        <tr><th className="p-3">Name</th><th className="p-3">Adm No</th><th className="p-3">Class</th><th className="p-3">Status</th><th className="p-3">Action</th></tr>
                    </thead>
                    <tbody>
                        {students.map(s => {
                            const status = s.comments?.[0]?.submission_status || s.comments?.submission_status || 'draft';
                            return (
                                <tr key={s.id} className="border-b">
                               : "", mid: "" });
  const [previewData, setPreviewData] = useState(null);
  const [schoolConfig, setSchoolConfig] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const { save, saving } = useAuto     <td className="p-3 font-bold">{s.name}</td>
                                    <td className="p-3">{s.admission_no}</td>
                                    <td className="p-3">{s.classes?.name}</td>
                                    <td className="p-3">
                                        {status === 'awaiting_approval' ? 
                                            <button onClick={async()=>{await supabase.from('comments').update({Save(async () => {
    if (!selectedStudent) return;
    await saveResultToDB();
  }, 1500);

  useEffect(() => {
    const init = async () => {
        const { data: cls } = await supabase.from('classes').select('*, schools(*)').eq('form_tutor_id', profile.id);
        setClasses(cls || []);
        if (cls?submission_status:'approved'}).eq('student_id',s.id); fetchSchoolData();}} className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-[10px] font-bold">Approve?</button> 
                                            : <span className="capitalize text-xs">{status}</span>
                                        }
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        <button onClick={() => loadStudentResult(s, 'full')} className="text-.[0]) {
            setSchoolConfig(cls[0].schools.assessment_config || []);
            setSchoolData(cls[0].schools);
            loadClass(cls[0].id);
        }
    };
    init();
  }, [profile]);

  const loadClass = async (classId) => {
    const cls = classes.find(c => c.id === classId);
    setCurClass(cls);
    setSelectedStudent(null);
    setShowAddStudent(false);
    const { data:blue-600"><Eye size={16}/></button>
                                        <button onClick={async()=>{if(window.confirm('Delete?')){await supabase.from('students').delete().eq('id',s.id); fetchSchoolData();}}} className="text-red-600"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )}
        {activeTab === 'classes' && (
            <div className="bg-white p-6 rounded shadow max-w-2xl">
                <h3 className="font-bold mb-4">Manage Classes</h3>
                <form onSubmit={async(e)=>{
                    e.preventDefault(); const fd=new FormData(e.target);
                    await supabase.from('classes').insert({school_id:school sub } = await supabase.from('subjects').select('*').eq('class_id', classId);
    setSubjects(sub || []);
    const { data: stu } = await supabase.from('students').select('*, classes(profiles(signature_url))').eq('class_id', classId).order('name');
    setStudents(stu || []);
  };

  const registerStudent = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const pin = generatePIN();
    const adm = generateAdmissionNumber();
    const { error } = await supabase.from('students').insert({
        school_id: schoolData.id, class_id: curClass.id,
        name: fd.get('name'), gender: fd.get('gender'),
        admission_no: adm, parent_pin: pin
    });
    if (error) alert(error.message);
    else { alert(`Success! PIN: ${pin}`); e.target.reset(); setShowAddStudent(false); loadClass(curClass.id); }
  };

  const loadStudentData = async (student) => {
    setSelectedStudent(null);
    setShowAddStudent(false);
    const { data: res } = await supabase.from('results').select('*, subjects(*)').eq('student_id', student.id);
    const scoreMap = {};
    subjects.forEach(s => {
      const existing = res?.find(r => r.subject_id === s.id);
      scoreMap[s.id] = existing?.scores || {};
    });
    setScores(scoreMap);
    const { data: comm } = await supabase.from.id, name:fd.get('name'), form_tutor_id:fd.get('tid')||null});
                    e.target.reset(); fetchSchoolData();
                }} className="flex gap-2 mb-6">
                    <input name="name" placeholder="Class Name" className="border p-2 rounded flex-1" required />
                    <select name="tid" className="border p-2 rounded flex-1">
                        <option value="">Select Tutor</option>
                        {teachers.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                    <button className="bg-blue-600 text-white px-4 rounded font-bold">Create</button>
                </form>
                <div className="grid grid-cols-1 sm:('comments').select('*').eq('student_id', student.id).maybeSingle();
    setComments({ full: comm?.tutor_comment || "", mid: comm?.midterm_tutor_comment || "" });
    setBehaviors(comm?.behaviors ? JSON.parse(comm.behaviors) : {});
    setSelectedStudent(student);
  };

  const updateScore = (subId, code, value, max) => {
    const num = Math.min(parseFloat(value) || 0, max);
    setScores(prev => ({ ...prev, [subId]: { ...prev[subId], [code]: numgrid-cols-2 gap-4">
                    {classes.map(c=>(
                        <div key={c.id} className="border p-3 rounded flex justify-between items-center bg-gray-50">
                            <div><p className="font-bold">{c.name}</p><p className="text-[10px] text-gray-400">{c.profiles?.full_name || 'No Tutor'}</p></div>
                            <button onClick={async()=>{if(window.confirm('Delete?')){await supabase.from('classes').delete().eq('id',c.id); fetchSchoolData();}}} className="text-red-400"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// ==================== TEACHER DASHBOARD ====================
const TeacherDashboard = ({ profile, onLogout }) => {
  const [classes, setClasses] = useState([]);
  const [curClass, setCurClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scores, setScores] = useState } }));
    save();
  };

  const saveResultToDB = async (status = null) => {
    if(!selectedStudent) return;
    const resultsPayload = subjects.map(s => {
      const subScores = scores[s.id] || {};
      let total = 0;
      schoolConfig.forEach(c => total += (subScores[c.code] || 0));
      return { student_id: selectedStudent.id, subject_id: s.id, scores: subScores, total };({});
  const [behaviors, setBehaviors] = useState({});
  const [comments, setComments] = useState({ full: "", mid: "" });
  const [previewData, setPreviewData] = useState(null);
  const [schoolConfig, setSchoolConfig] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const { save, saving } = useAutoSave(async () => {
    if (!selectedStudent) return;
    await saveResultToDB();
  }, 1500);

  useEffect(() => {
    const init = async () => {
        const { data: cls } = await supabase.from('classes').select('*, schools
    });
    await supabase.from('results').delete().eq('student_id', selectedStudent.id);
    await supabase.from('results').insert(resultsPayload);
    const payload = { 
        student_id: selectedStudent.id, school_id: curClass.school_id, 
        tutor_comment: comments.full, midterm_tutor_comment: comments.mid,
        behaviors: JSON.stringify(behaviors) 
    };
    if (status) payload.submission_status = status;
    await supabase.from('comments').upsert(payload, { onConflict: 'student_id'(*)').eq('form_tutor_id', profile.id);
        setClasses(cls || []);
        if (cls?.[0]) {
            setSchoolConfig(cls[0].schools.assessment_config || []);
            setSchoolData(cls[0].schools);
            loadClass(cls[0].id);
        }
    };
    init();
  }, [profile]);

  const loadClass = async (classId) => {
    const cls = classes.find(c => c.id === classId);
    setCurClass(cls);
    setSelectedStudent(null);
    setShowAddStudent(false);
 });
  };

  const handlePreview = async () => {
    await saveResultToDB();
    const { data: results } = await supabase.from('results').select('*, subjects(*)').eq('student_id', selectedStudent.id);
    const logoBase64 = await imageUrlToBase64(schoolData.logo_url);
    const principalSigBase64 = await imageUrlToBase64(schoolData.principal_signature_url);
    const { data: teacherProfile } = await supabase.from('profiles').select('signature_url').eq('id', profile.id).single();
    const teacherSigBase64 = await imageUrl    const { data: sub } = await supabase.from('subjects').select('*').eq('class_id', classId);
    setSubjects(sub || []);
    const { data: stu } = await supabase.from('students').select('*, classes(profiles(signature_url))').eq('class_id', classId).order('name');
    setStudents(stu || []);
  };

  const registerStudent = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    constToBase64(teacherProfile?.signature_url);
    const behaviorArray = BEHAVIORAL_TRAITS.map(trait => ({ trait, rating: behaviors[trait] || 'Good' }));

    setPreviewData({ 
        school: schoolData, student: selectedStudent, classInfo: { ...curClass }, 
        results: results || [], comments: { tutor_comment: comments.full, midterm_tutor_comment: comments.mid }, behaviors: behaviorArray, 
        logoBase64, principalSigBase64, teacher pin = generatePIN();
    const adm = generateAdmissionNumber();
    const { error } = await supabase.from('students').insert({
        school_id: schoolData.id, class_id: curClass.id,
        name: fd.get('name'), gender: fd.get('gender'),
        admission_no: adm, parent_pin: pin
    });
    if (error) alert(error.message);
    else { alert(`Success! PIN: ${pin}`); e.target.reset(); setShowAddStudent(falseSigBase64
    });
  };

  if (previewData) {
      return (
          <div className="fixed inset-0 bg-gray-100 flex flex-col z-50">
              <div className="bg-white p-4 shadow flex justify-between items-center">
                  <button onClick={() => setPreviewData(null)}><X /> Back</button>
                  <div className="flex gap-2); loadClass(curClass.id); }
  };

  const loadStudentData = async (student) => {
    setSelectedStudent(null);
    setShowAddStudent(false);
    const { data: res } = await supabase.from('results').select('*, subjects(*)').eq('student_id', student.id);
    const scoreMap = {};
    subjects.forEach(s => {
      const existing = res?.find(r => r.subject_id === s.id);
      scoreMap[s.id] =">
                     <button onClick={async()=>{if(window.confirm('Submit?')){ await saveResultToDB('awaiting_approval'); setPreviewData(null); }}} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Final Submit</button>
                     <PDFDownloadLink document={<ResultPDF {...previewData} reportType="full" logoBase64={previewData.logoBase64} principalSigBase64={previewData.principalSigBase64} teacherSigBase64={previewData.teacherSigBase64} existing?.scores || {};
    });
    setScores(scoreMap);
    const { data: comm } = await supabase.from('comments').select('*').eq('student_id', student.id).maybeSingle();
    setComments({ full: comm?.tutor_comment || "", mid: comm?.midterm_tutor_comment || "" });
    setBehaviors(comm?.behaviors ? JSON.parse(comm.behaviors) : {});
    setSelectedStudent(student);
    setSidebarOpen(false); 
  };

  const updateScore = (subId, code, value, max) => {
    const num = Math. />} fileName="Result.pdf"><button className="bg-blue-600 text-white px-3 py-1 rounded text-xs">PDF</button></PDFDownloadLink>
                  </div>
              </div>
              <PDFViewer className="flex-1 w-full"><ResultPDF {...previewData} reportType="full" logoBase64={previewData.logoBase64} principalSigBase64={previewData.principalSigBase64} teacherSigBase64={previewData.teacherSigBase64} /></PDFViewer>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-gray-min(parseFloat(value) || 0, max);
    setScores(prev => ({ ...prev, [subId]: { ...prev[subId], [code]: num } }));
    save();
  };

  const saveResultToDB = async (status = null) => {
    if(!selectedStudent) return;
    const resultsPayload = subjects.map(s => {
      const subScores = scores[s.id] || {};
      let total = 0;
      schoolConfig.forEach(c => total += (sub50 flex-col md:flex-row overflow-hidden">
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 inset-y-0 left-0 w-80 bg-white border-r flex flex-col transition duration-200`}>
        <div className="p-4 bg-slate-900 text-white flex justify-between">
            <h2 className="font-bold">{profile.fullScores[c.code] || 0));
      return { student_id: selectedStudent.id, subject_id: s.id, scores: subScores, total };
    });
    await supabase.from('results').delete().eq('student_id', selectedStudent.id);
    await supabase.from('results').insert(resultsPayload);
    const payload = { 
        student_id: selectedStudent.id, school_name}</h2>
            <button onClick={onLogout}><LogOut size={16}/></button>
        </div>
        <div className="p-4 border-b">
             <button onClick={() => {_id: curClass.school_id, 
        tutor_comment: comments.full, midterm_tutor_comment: comments.mid,
        behaviors: JSON.stringify(behaviors) 
    };
    if (status) payload.submission_status = status;
    await supabase.from('comments').upsert(payload, { onConflict: 'student_id' });
  };

  const handlePreview = async () => {
    await saveResultToDB();
    const { data: results } = await supabase. setShowAddStudent(true); setSelectedStudent(null); }} className="w-full bg-blue-600 text-white py-2 rounded shadow text-sm font-bold flex items-center justify-center gap-2 mb-2">
                 <UserPlus size={18}/> Register Student
             </button>
             <select className="w-full border p-2 rounded text-sm bg-gray-50" onChange={(e) => loadClass(parseInt(e.target.value))}>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <div className="flex-1 overflow-y-auto">
            {curClassfrom('results').select('*, subjects(*)').eq('student_id', selectedStudent.id);
    const logoBase64 = await imageUrlToBase64(schoolData.logo_url);
    const principalSigBase64 = await imageUrlToBase64(schoolData.principal_signature_url);
    const { data: teacherProfile } = await supabase.from('profiles').select('signature_url').eq('id', profile.id && (
                <>
                <div className="p-3 bg-gray-50 font-bold text-[10px] text-gray-400 border-b flex justify-between">
                    <span>STUDENTS ({students.length})</span>
                </div>
                {students.map(s => (
                    <div key={s.id).single();
    const teacherSigBase64 = await imageUrlToBase64(teacherProfile?.signature_url);
    const behaviorArray = BEHAVIORAL_TRAITS.map(trait => ({ trait, rating: behaviors[trait] || 'Good' }));

    setPreviewData({ 
        school: schoolData, student: selectedStudent, classInfo: { ...curClass }, 
        results: results || [], comments: { tutor_comment: comments.full, midterm_tutor_comment: comments.mid }, behaviors: behaviorArray, 
        logoBase64, principalSigBase64, teacherSigBase64
    });
  };

  if (previewData) {
      return (
          <div className="fixed inset-0 bg-gray-100 flex flex-col z-50">
              <div className="bg-white p-4 shadow} onClick={() => loadStudentData(s)} className={`p-3 border-b cursor-pointer flex justify-between text-sm ${selectedStudent?.id === s.id ? 'bg-blue-600 text-white font-bold' : ''}`}>
                        <span>{s.name}</span>
                    </div>
                ))}
                </>
            )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {showAddStudent ? (
            <div className="max-w-md mx-auto bg-white p-8 rounded shadow border-t-4 border-blue-600">
                <h2 className="text-xl font-bold mb-6">Register Student</h2>
                <form onSubmit={registerStudent} className="space-y-4">
                    < flex justify-between items-center">
                  <button onClick={() => setPreviewData(null)} className="flex items-center gap-1 font-bold"><X /> Back</button>
                  <div className="flex gap-2">
                     <button onClick={async()=>{if(window.confirm('Submit?')){ await saveResultToDB('awaiting_approval'); setPreviewData(null); }}} className="bg-green-600 text-white px-3 py-2 rounded font-bold text-xs"><ShieldCheck size={14}/> Submitinput name="name" placeholder="Full Name" className="w-full border p-3 rounded" required />
                    <select name="gender" className="w-full border p-3 rounded"><option>Male</option><option>Female</option></select>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">Complete Registration</button>
                    <button type="button" onClick={()=>setShowAddStudent(false)} className="w-full text-gray-500</button>
                     <PDFDownloadLink document={<ResultPDF {...previewData} reportType="mid" logoBase64={previewData.logoBase64} principalSigBase64={previewData.principalSigBase64} teacherSigBase64={previewData.teacherSigBase64} />} fileName="MidTerm.pdf"><button className="bg-blue-100 text-blue-700 px-3 py-2 rounded font-bold text">Cancel</button>
                </form>
            </div>
        ) : !selectedStudent ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Users size={64} className="mb-4 text-gray-200"/>
                <p>Select a student from the menu to record scores.</p>
            </div>
        ) : (
            <div>
-xs">Mid-Term</button></PDFDownloadLink>
                     <PDFDownloadLink document={<ResultPDF {...previewData} reportType="full" logoBase64={previewData.logoBase64} principalSigBase64={previewData.principalSigBase64} teacherSigBase64={previewData.teacherSigBase64} />} fileName="FullTerm.pdf"><button className="bg-blue-600 text-white px-3 py-2 rounded font-bold text-xs">Full-Term</button></PDFDownloadLink>
                  </div>                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow border">
                    <div><h1 className="text-2xl font-bold">{selectedStudent.name}</h1><p className="text-xs text-blue-600">{selectedStudent.admission_no}</p></div>
                    <div className="flex items-center gap-4">
                        {saving && <span className="text-[10px] text-green-600 font-bold animate-pulse">Saving...</span>}
                        <button onClick={handlePreview} className="bg-slate-900 text-white px-4 py
              </div>
              <PDFViewer className="flex-1 w-full"><ResultPDF {...previewData} reportType="full" logoBase64={previewData.logoBase64} principalSigBase64={previewData.principalSigBase64} teacherSigBase64={previewData.teacherSigBase64} /></PDFViewer>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-2 rounded font-bold flex items-center gap-2 text-sm"><Eye size={18}/> Preview</button>
                    </div>
                </div>

                <div className="bg-white rounded border shadow overflow-hidden mb-8">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3 text-left-gray-50 flex-col md:flex-row overflow-hidden">
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 inset-y-0 left-0 w-80 bg-white border-r flex flex-col transition duration-200`}>
        <div className="p-4 bg-slate-900 text-white">
            <div className="flex justify-between items-center">
                <h2 className="font-bold truncate text-lg">{profile.full_name}</h2>
                <button onClick={onLogout} className="text-red-400"><LogOut size={16}/></button>
            </div>
            <p className="text-[10px] text-slate-40">Subject</th>
                                {schoolConfig.map(c => <th key={c.code} className="p-3 text-center">{c.name}</th>)}
                                <th className="p-3 text-center bg-gray-50 font-bold">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map(s => {
                                let total = 0; schoolConfig.forEach(c => total += (scores[s.id]?.[c.code] || 0));
                                return (
                                    <tr key={s.id} className="border-b">
                                        <td className="p-3 font-bold">{s.name}</td>
                                        {schoolConfig.map(c => (
                                            <td0 mt-1 uppercase tracking-widest">{curClass?.name || 'Loading...'}</p>
        </div>
        <div className="p-4 border-b">
             <button onClick={() => { setShowAddStudent(true); setSelectedStudent(null); }} className="w-full bg-blue-600 text-white py-2.5 rounded shadow text-sm font-bold flex items-center justify-center gap-2 mb-2">
                 <UserPlus size={18}/> Add New Student
             </button>
             < key={c.code} className="p-3 text-center">
                                                <input type="number" className="w-16 border rounded p-1 text-center font-bold" 
                                                    value={scores[s.id]?.[c.code] || ''} onChange={(e) => updateScore(s.id, c.code, e.target.value, c.max)} 
                                                />
                                            </td>
                                        ))}
                                        <td className="p-3 text-center font-black text-blueselect className="w-full border p-2 rounded text-sm bg-gray-50" onChange={(e) => loadClass(parseInt(e.target.value))}>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <div className="flex-1 overflow-y-auto">
            {curClass && (
                <>
                <div className="p-3 bg-gray-50 font-bold text-[10px] text-gray-400 border-b flex justify-between">
                    <span>SUBJECT-600 bg-gray-50">{total}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded shadow border">
                        <h3 className="font-bold text-xs mb-2">Mid-Term Remark</h3>
                        <textarea className="w-full border p-3 rounded h-24 text-sm" value={comments.mid}S</span>
                    <button onClick={async()=>{const n=window.prompt('Subject:'); if(n){await supabase.from('subjects').insert({class_id:curClass.id,name:n}); loadClass(curClass.id);}}}><Plus size={16}/></button>
                </div>
                <div className="p-3 bg-gray-50 font-bold text-[10px] text-gray-400 onChange={(e) => { setComments(p => ({...p, mid: e.target.value})); save(); }} />
                    </div>
                    <div className="bg-white p-6 rounded shadow border">
                        <h3 className="font-bold text-xs mb-2">Full Term Remark</h3>
                        <textarea className="w-full border p-3 rounded h-24 text-sm" value={comments.full} onChange={(e) => { setComments(p => ({...p, full: e.target.value})); save(); border-b">STUDENTS ({students.length})</div>
                {students.map(s => (
                    <div key={s.id} onClick={() => loadStudentData(s)} className={`p-3 border- }} />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// ==================== AUTH & PORTALS ====================
const Auth = ({ onLogin, onParent })b cursor-pointer flex justify-between text-sm ${selectedStudent?.id === s.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-50'}`}>
                        <span>{s.name}</span>
                        <Trash2 size={14} className="text-gray-300" onClick={async(e)=>{e.stopPropagation(); if(window.confirm('Delete student?')){await supabase.from('students').delete().eq('id',s.id); loadClass(curClass.id);}}}/>
                    </div>
                ))}
                </>
            )}
        </div>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="md:hidden mb-4 flex justify-between items-center"><button onClick={()=>setSidebarOpen(true)}><Menu/></button><h => {
    const [mode, setMode] = useState('login'); 
    const [form, setForm] = useState({ email: '', password: '', name: '', pin: '', schoolCode: '' });
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            if (mode === 'central') {
                if (form.email === 'oluwatoyin' && form.password === 'Funmilola') onLogin({ role: 'central' });
            } else if (mode === 'school_reg') {
                const { data: pinData } = await supabase.from('subscription_pins').select('*').eq('code', form.pin).eq('is_used', false).single();
                if (!pinData) throw new Error('Invalid or Used PIN');
                const { data: auth } = await supabase.auth.signUp({ email: form.email, password: form.password });
                if(auth.user) {
                    const { data:1 className="font-bold">{curClass?.name}</h1></div>
        {showAddStudent ? (
            <div className="max-w-md mx-auto bg-white p-8 rounded shadow-lg border-t-4 border-blue-600">
                <h2 className="text-xl font-bold mb-6">Register Student</h2>
                <form onSubmit={registerStudent} className="space-y-4">
                    <input name="name" placeholder="Full Name" className="w-full border p-3 rounded" school } = await supabase.from('schools').insert({ owner_id: auth.user.id, name: 'My School', max_students: pinData.student_limit }).select().single();
                    await supabase.from('profiles').insert({ id: auth.user.id, full_name: form.name, role: 'admin', school_id: school.id });
                    await supabase.from('subscription_pins').update({ is_used: true }).eq('id', pinData.id);
                    alert("Registration Successful!"); setMode('login');
 required />
                    <select name="gender" className="w-full border p-3 rounded"><option>Male</option><option>Female</option></select>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded font-bold">Register</button>
                        <button type="button" onClick={()=>setShowAddStudent(false                }
            } else if (mode === 'teacher_reg') {
                 const { data: sch } = await supabase.from('schools').select('id').eq('id', form.schoolCode).single();
                 if (!sch) throw new Error('Invalid School Code');
                 const { data: auth } = await supabase.auth.signUp({ email: form.email, password: form.password });
                 if(auth.user){
                    )} className="flex-1 bg-gray-100 py-2 rounded font-bold">Cancel</button>
                    </div>
                </form>
            </div>
        ) : !selectedStudent ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Users size={64} className="mb-4 text-gray-200"/>
                <p>Select a student from the menu to record scores.</p>
            </div>
        ) : (
await supabase.from('profiles').insert({ id: auth.user.id, full_name: form.name, role: 'teacher', school_id: sch.id });
                    alert("Registered! Please Login."); setMode('login');
                 }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
                if (error) throw error;
            }
        } catch (err) { alert(err.message); } finally { setLoading(false            <div>
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow border">
                    <div><h1 className="text-2xl font-bold">{selectedStudent.name}</h1><p className="text-xs text-blue-600">{selectedStudent.admission_no}</p></div>
                    <div className="flex items-center gap-4">
                        {saving && <span); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded shadow w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Springforth Results</h1>
                <div className="flex gap-4 mb-6 text className="text-[10px] text-green-600 font-bold animate-pulse uppercase">Saving...</span>}
                        <button onClick={handlePreview} className="bg-slate-900 text-white px-4 py-2 rounded font-bold flex items-center gap-2 text-sm"><Eye size={18}/> Preview</button>
                    </div>
                </div>
                <div className="bg-white rounded border shadow overflow-hidden mb-8">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3 text-left">Subject</th>
                                {schoolConfig.map(c => <th key={c.code} className-xs justify-center border-b pb-2">
                    <button onClick={()=>setMode('login')} className={mode==='login'?'font-bold border-b border-black':''}>Login</button>
                    <button onClick={()=>setMode('school_reg')} className={mode==='school_reg'?'font-bold border-b="p-3 text-center">{c.name}</th>)}
                                <th className="p-3 text-center bg-gray-50 font-bold">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map(s => {
                                let total = 0; schoolConfig.forEach(c => total += (scores[s.id]?.[c.code] || 0));
                                return (
                                    <tr key={s.id} className="border-b">
                                        <td className="p- border-black':''}>School Reg</button>
                    <button onClick={()=>setMode('teacher_reg')} className={mode==='teacher_reg'?'font-bold border-b border-black':''}>Teacher Reg</button>
                </div>
                <form onSubmit={handleAuth} className="space-y-4">
                    {mode.includes('reg') && <input placeholder="Full Name" className="w-full p-23 font-bold">{s.name}</td>
                                        {schoolConfig.map(c => (
                                            <td key={c.code} className="p-3 text-center">
                                                <input type="number" className="w-16 border rounded p-1 text-center font-bold" 
                                                    value={scores[s.id]?.[c.code] || ''} onChange={(e) => updateScore(s.id, c.code, e.target.value, c.max)} 
                                                />
                                            </td>
                                        ))}
                                        <td className="p-3 text-center font-black border rounded" onChange={e=>setForm({...form, name:e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={e=>setForm({...form, email:e.target.value})} required />
                    <input type="password" placeholder="Password" className="w-full p-2 border rounded" onChange={e=>setForm({...form, password:e.target.value})} required />
                    {mode === 'school_reg' && <input placeholder="Subscription PIN" className="w-full p-2 border rounded" onChange={e=>setForm({...form, pin:e.target.value})} required />}
                    {mode === 'teacher_reg' && <input placeholder text-blue-600 bg-gray-50">{total}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded shadow="School ID" className="w-full p-2 border rounded" onChange={e=>setForm({...form, schoolCode:e.target.value})} required />}
                    <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Access Portal</button>
                </form>
                {mode === 'login' && <button onClick={onParent} className="w-full bg-green-600 text-white py-2 rounded font-bold mt-4">Check Result</button>}
            </div>
        </div>
    );
};

const ParentPortal = ({ onBack }) => {
     border">
                        <h3 className="font-bold mb-4 border-b pb-2 uppercase text-[10px] text-gray-400">Behavioral Traits</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {BEHAVIORAL_TRAITS.map(t => (
                                <div key={t} className="flex justify-between items-center p-1 border-b">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">{t}</label>
                                    <select className="text-[10pxconst [creds, setCreds] = useState({ adm: '', pin: '' });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchResult = async (e) => {
        e.preventDefault(); setLoading(true);
        const { data: stu } = await supabase.from('students').select('*, schools(*), classes(*, profiles(signature_url)), comments(*), results(*, subjects(*))').eq('admission_no', creds.adm).eq('parent_pin', creds.pin).maybeSingle();
        if (!stu) { alert('Invalid');] font-bold outline-none" value={behaviors[t] || 'Good'} onChange={(e) => { setBehaviors(p => ({...p, [t]: e.target.value})); save(); }}>
                                        {RATINGS.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded shadow border">
                            <h3 className="font-bold text-xs mb-2">Mid-Term Remark</h3>
                            <textarea className="w-full border p-3 rounded h-24 text-sm" value={comments.mid} onChange setLoading(false); return; }
        const comm = Array.isArray(stu.comments) ? stu.comments[0] : stu.comments;
        if (comm?.submission_status !== 'approved') { alert("Not yet approved."); setLoading(false); return; }
        const logoBase64 = await imageUrlToBase64(stu.schools.logo_url);
        const principalSigBase64 = await imageUrlToBase64(stu.schools.principal_signature_url);
        const teacherSigBase64 = await imageUrlToBase64(stu.classes?.profiles?.signature_url);
        setData({ student: stu, school: stu.schools, classInfo: stu.classes, results: stu.results, comments: comm || {}, behaviors: [], logoBase={(e) => { setComments(p => ({...p, mid: e.target.value})); save(); }} />
                        </div>
                        <div className="bg-white p-6 rounded shadow border">
                            <h3 className="font-bold text-xs mb-2">Full Term Remark</h3>
                            <textarea className="w-full border p-3 rounded h-24 text-sm" value={comments.full} onChange={(e) => { setComments(p => ({...p, full: e.target.value})); save(); }}64, principalSigBase64, teacherSigBase64 });
        setLoading(false);
    };

    if (data) return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 h-screen">
            <div className="bg-white p-4 shadow flex justify-between"><button onClick={()=>setData(null)}>Exit</button><PDFDownloadLink document={<ResultPDF {...data} reportType="full" logoBase64={data.logoBase64} principalSigBase64={data.principalSigBase64} teacherSigBase64={data.teacherSigBase64} />} />
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// ==================== AUTH & PORTALS ====================
const Auth = ({ onLogin, onParent }) => {
    const [mode, setMode] = useState('login'); 
    const [form, setForm] = useState({ email: '', password: '', name: '', pin: '', schoolCode: '' }); fileName="Result.pdf"><button className="bg-blue-600 text-white px-4 py-2 rounded">Download</button></PDFDownloadLink></div>
            <PDFViewer className="flex-1 w-full"><ResultPDF {...data} reportType="full" logoBase64={data.logoBase64} principalSigBase
    const [loading, setLoading] = useState(false);
    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            if (mode === 'central') {
                if (form.email === 'oluwatoyin' && form.password === 'Funmilola') onLogin({ role: 'central' });
            } else if (mode === 'school_reg') {
                const { data: pinData } = await supabase.from('subscription_pins').select('*').eq('code', form.pin).eq('is_used', false).single();
                if (!pinData) throw new Error('64={data.principalSigBase64} teacherSigBase64={data.teacherSigBase64} /></PDFViewer>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
            <form onSubmit={fetchResult} className="bg-white p-8 rounded shadow w-full max-w-sm">
                <h2 className="text-xl font-bold text-center mb-6">Parent Portal</h2>
                <input placeholder="Admission No" className="w-full p-2 border rounded mb-3" onChange={e=>Invalid or Used PIN');
                const { data: auth } = await supabase.auth.signUp({ email: form.email, password: form.password });
                if(auth.user) {
                    const { data: school } = await supabase.from('schools').insert({ owner_id: auth.user.id, name: 'My School', max_students: pinData.student_limit }).select().single();
                    await supabase.from('profiles').insert({ id: auth.user.id, full_name: form.name, role:setCreds({...creds, adm:e.target.value})} required />
                <input type="password" placeholder="Access PIN" className="w-full p-2 border rounded mb-4" onChange={e=>setCreds({...creds, pin:e.target.value})} required />
                <button className="w-full bg-green-600 text-white py-2 rounded">Check Result</button>
                < 'admin', school_id: school.id });
                    await supabase.from('subscription_pins').update({ is_used: true }).eq('id', pinData.id);
                    alert("Success! Please Login."); setMode('login');
                }
            } else if (mode === 'teacher_reg' || mode === 'admin_reg') {
                 const role = mode === 'teacher_reg' ? 'teacher' : 'admin';
                 let schoolId = null;
                 if (role === 'teacher') {
                     const { data: sch } = await supabase.from('schools').select('id').eq('id', form.schoolCodebutton onClick={onBack} className="w-full text-xs mt-4">Back</button>
            </form>
        </div>
    );
};

const CentralAdmin = ({ onLogout }) => {
    const [pins, setPins] = useState([]);
    useEffect(()=>{ const f = async () => { const {data} = await supabase.from('subscription_pins').select('*'); setPins(data||[]); }; f(); },[]);
    return (
        <div className="p-8 bg-slate-900 min-h-screen text-white">
            <h1 className="text-2xl font-bold mb-4">Central</h1>
).single();
                     if (!sch) throw new Error('Invalid School Code');
                     schoolId = sch.id;
                 } else {
                     const { data: schs } = await supabase.from('schools').select('*'); 
                     const targetSchool = schs?.find(s => (s.admin_invites || []).some(inv => inv.code === form.schoolCode && inv.email === form.email));
                     if (!targetSchool) throw new Error("Invalid Invite Code or Email mismatch.");
                     schoolId = targetSchool.id;
                 }
                 const { data: auth } = await supabase.auth.signUp({ email            <button onClick={async()=>{ await supabase.from('subscription_pins').insert({ code: `SUB-${Math.floor(Math.random()*90000)}`, student_limit: 100 }); window.location.reload(); }} className="bg-blue-600 p-2 rounded mb-6">Generate PIN</button>
            <div className="grid grid-cols-4 gap-4">
                {pins.map(p=><div key={p.id} className="p-2 border">{p.code}</div>)}
            </div>
            <button onClick={onLogout} className="mt-8 text-red-400">Logout: form.email, password: form.password });
                 if(auth.user){
                    await supabase.from('profiles').insert({ id: auth.user.id, full_name: form.name, role: role, school_id: schoolId });
                    alert(`${role} Registered! Please Login.`); setMode('login');
                 }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
                if (error) throw error;
            }</button>
        </div>
    );
};

// ==================== APP ROOT ====================
const App = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('auth');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession
        } catch (err) { alert(err.message); } finally { setLoading(false); }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-t-4 border-blue-600().then(({ data: { session } }) => { setSession(session); if(!session) setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); if (!session) { setProfile(null); setView('auth'); setLoading(false); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        const">
                <div className="text-center mb-6"><div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"><School className="text-blue-600" size={24} /></div><h1 className="text-2xl font-bold">Springforth Results</h1></div>
                <div className="flex flex-wrap justify-center gap-3 mb-6 text-[10px] font-bold uppercase border-b pb-2 { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        setProfile(data); setLoading(false);
      };
      fetchProfile();
    }
  }, [session]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48}/></div>;
  if (view === 'central') return <CentralAdmin onLogout={() => setView('auth">
                    {['login', 'school_reg', 'teacher_reg', 'admin_reg'].map(m => <button key={m} onClick={()=>setMode(m)} className={`capitalize ${mode===m?'text-blue-600 border-b border-blue-600':''}`}>{m.replace('_', ' ')}</button>)}
                </div>
                <form onSubmit={handleAuth} className="space-y-4">
                    {mode.includes('reg') && <input placeholder="Full Name" className="w-full p-2 border rounded" onChange={e=>setForm({...form, name:e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={e=>setForm({...form, email:e.target.value})} required />
                    <')} />;
  if (view === 'parent') return <ParentPortal onBack={() => setView('auth')} />;
  if (!session) return <Auth onLogin={(d) => setView(d.role === 'central' ? 'central' : 'dashboard')} onParent={() => setView('parent')} />;
  if (!profile) return <div className="h-screen flex items-center justify-center text-red-500 font-bold">Profile Error. Contact Support.</div>;

  return profile.role === 'admin' ? <SchoolAdmin profile={profile} onLogout={() => supabase.auth.signOut()} /> : <TeacherDashboard profile={profile} onLogout={() => supabase.auth.signOut()} />;
};

export default App;
