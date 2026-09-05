import { Candidate } from '../types';

export class ExportService {
  static async exportCandidates(
    candidates: Candidate[], 
    format: string, 
    stats: any
  ): Promise<void> {
    switch (format.toLowerCase()) {
      case 'pdf':
        await this.exportToPDF(candidates, stats);
        break;
      case 'excel':
        await this.exportToExcel(candidates, stats);
        break;
      case 'csv':
        await this.exportToCSV(candidates, stats);
        break;
      case 'json':
        await this.exportToJSON(candidates, stats);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private static async exportToPDF(candidates: Candidate[], stats: any): Promise<void> {
    // Create a comprehensive PDF report
    const content = this.generatePDFContent(candidates, stats);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups.');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume Analysis Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #007bff;
              padding-bottom: 20px;
            }
            .stats { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 20px; 
              margin-bottom: 30px; 
            }
            .stat-card { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px; 
              text-align: center;
              border: 1px solid #dee2e6;
            }
            .stat-number { 
              font-size: 24px; 
              font-weight: bold; 
              color: #007bff; 
            }
            .candidate { 
              margin-bottom: 25px; 
              padding: 20px; 
              border: 1px solid #dee2e6; 
              border-radius: 8px;
              background: #fff;
            }
            .candidate-header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 15px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .score-badge { 
              padding: 5px 15px; 
              border-radius: 20px; 
              color: white; 
              font-weight: bold; 
            }
            .score-excellent { background: #28a745; }
            .score-strong { background: #007bff; }
            .score-moderate { background: #ffc107; color: #000; }
            .score-weak { background: #dc3545; }
            .skills { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 5px; 
              margin: 10px 0; 
            }
            .skill { 
              background: #e9ecef; 
              padding: 3px 8px; 
              border-radius: 12px; 
              font-size: 12px; 
            }
            .skill-matched { background: #d4edda; color: #155724; }
            .skill-missing { background: #f8d7da; color: #721c24; }
            @media print {
              body { margin: 0; }
              .candidate { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  }

  private static generatePDFContent(candidates: Candidate[], stats: any): string {
    const sortedCandidates = [...candidates].sort((a, b) => b.match_score - a.match_score);
    
    return `
      <div class="header">
        <h1>Resume Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-number">${stats.totalCandidates}</div>
          <div>Total Candidates</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.relevantCandidates}</div>
          <div>Relevant Matches</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.averageScore}%</div>
          <div>Average Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.topCandidates}</div>
          <div>Top Candidates</div>
        </div>
      </div>

      <h2>Candidate Rankings</h2>
      ${sortedCandidates.map((candidate, index) => `
        <div class="candidate">
          <div class="candidate-header">
            <div>
              <h3>${candidate.candidate_name}</h3>
              <p><strong>Experience:</strong> ${candidate.experience_years} years | <strong>Level:</strong> ${candidate.experience_level}</p>
            </div>
            <div class="score-badge ${this.getScoreClass(candidate.match_score)}">
              ${candidate.match_score}%
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>Summary:</strong> ${candidate.summary}
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>Education:</strong> ${candidate.education}
          </div>
          
          ${candidate.matched_skills.length > 0 ? `
            <div style="margin-bottom: 10px;">
              <strong>Matched Skills:</strong>
              <div class="skills">
                ${candidate.matched_skills.map(skill => `<span class="skill skill-matched">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${candidate.missing_skills.length > 0 ? `
            <div style="margin-bottom: 10px;">
              <strong>Missing Skills:</strong>
              <div class="skills">
                ${candidate.missing_skills.map(skill => `<span class="skill skill-missing">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          <div style="margin-bottom: 10px;">
            <strong>AI Recommendation:</strong> ${candidate.recommendation}
          </div>
          
          ${candidate.notable_companies.length > 0 ? `
            <div>
              <strong>Notable Companies:</strong> ${candidate.notable_companies.join(', ')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    `;
  }

  private static async exportToExcel(candidates: Candidate[], stats: any): Promise<void> {
    // Export both Interview Schedule Template and Candidate Data
    await this.exportInterviewScheduleTemplate(candidates);
    await this.exportCandidateData(candidates, stats);
  }

  private static async exportInterviewScheduleTemplate(candidates: Candidate[]): Promise<void> {
    // Create Interview Schedule Template based on the form structure
    const topCandidates = candidates
      .filter(c => c.match_score >= 80)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 20); // Top 20 candidates for interviews

    const headers = [
      'Interview ID',
      'Title',
      'Description',
      'Candidate Name',
      'Candidate Email',
      'Candidate Phone',
      'Match Score',
      'Experience Level',
      'Interviewer Name',
      'Interviewer Email',
      'Date',
      'Time',
      'Status',
      'Notes',
      'Interview Type',
      'Duration (minutes)',
      'Location/Meeting Link',
      'Preparation Notes'
    ];

    const templateRows = topCandidates.map((candidate, index) => [
      `INT-${String(index + 1).padStart(3, '0')}`,
      'Technical Interview', // Default title
      `Technical interview for ${candidate.experience_level} position`, // Default description
      candidate.candidate_name,
      candidate.contact_info.email || '',
      candidate.contact_info.phone || '',
      candidate.match_score,
      candidate.experience_level,
      'Rajnish Pandey', // Default interviewer from the image
      'rajnish.pandey@company.com', // Default interviewer email
      '', // Date - to be filled
      '09:00', // Default time from the image
      'Scheduled',
      `Top skills: ${candidate.matched_skills.slice(0, 3).join(', ')}`,
      'Video Call',
      '60',
      'https://meet.google.com/xxx-xxxx-xxx',
      `Focus areas: ${candidate.matched_skills.join(', ')}`
    ]);

    // Add some empty rows for manual entry
    for (let i = 0; i < 10; i++) {
      templateRows.push([
        `INT-${String(topCandidates.length + i + 1).padStart(3, '0')}`,
        '', '', '', '', '', '', '', 'Rajnish Pandey', 'rajnish.pandey@company.com',
        '', '09:00', 'Pending', '', 'Video Call', '60', '', ''
      ]);
    }

    const csvContent = this.generateCSVContent([headers, ...templateRows], true);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, 'interview-schedule-template.csv');
  }

  private static async exportCandidateData(candidates: Candidate[], stats: any): Promise<void> {
    // Create detailed candidate data export
    const csvContent = this.generateCandidateCSVContent(candidates, false);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, 'candidate-analysis-data.csv');
  }

  private static async exportToCSV(candidates: Candidate[], stats: any): Promise<void> {
    // Export both files for CSV as well
    await this.exportInterviewScheduleTemplate(candidates);
    await this.exportCandidateData(candidates, stats);
  }

  private static generateCandidateCSVContent(candidates: Candidate[], includeHeaders: boolean): string {
    const headers = [
      'Rank',
      'Name',
      'Email',
      'Phone',
      'Match Score',
      'Experience Years',
      'Experience Level',
      'Education',
      'Skills',
      'Matched Skills',
      'Missing Skills',
      'Hire Probability',
      'Salary Range',
      'Notable Companies',
      'Recommendation',
      'Is Relevant',
      'Strengths',
      'Weaknesses',
      'Interview Questions',
      'Issues Detected',
      'Summary',
      'Skill Diversity',
      'Company Prestige',
      'Certifications'
    ];

    const sortedCandidates = [...candidates].sort((a, b) => b.match_score - a.match_score);
    
    const rows = sortedCandidates.map((candidate, index) => [
      index + 1,
      candidate.candidate_name,
      candidate.contact_info.email || '',
      candidate.contact_info.phone || '',
      candidate.match_score,
      candidate.experience_years,
      candidate.experience_level,
      candidate.education,
      candidate.skills.join('; '),
      candidate.matched_skills.join('; '),
      candidate.missing_skills.join('; '),
      Math.round((candidate.hire_probability || 0) * 100) + '%',
      candidate.salary_range,
      candidate.notable_companies.join('; '),
      candidate.recommendation,
      candidate.is_relevant ? 'Yes' : 'No',
      candidate.strengths.join('; '),
      candidate.weaknesses.join('; '),
      candidate.interview_questions.join('; '),
      candidate.issues_detected.join('; '),
      candidate.summary,
      Math.round((candidate.skill_diversity || 0) * 100) + '%',
      Math.round((candidate.company_prestige || 0) * 100) + '%',
      candidate.certifications.join('; ')
    ]);

    const csvRows = includeHeaders ? [headers, ...rows] : rows;
    
    return this.generateCSVContent(csvRows, false);
  }

  private static generateCSVContent(data: any[][], isTemplate: boolean): string {
    return data.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',')
    ).join('\n');
  }

  private static async exportToJSON(candidates: Candidate[], stats: any): Promise<void> {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalCandidates: stats.totalCandidates,
        relevantCandidates: stats.relevantCandidates,
        averageScore: stats.averageScore,
        topCandidates: stats.topCandidates
      },
      candidates: candidates.sort((a, b) => b.match_score - a.match_score),
      interviewSchedule: {
        topCandidates: candidates
          .filter(c => c.match_score >= 80)
          .sort((a, b) => b.match_score - a.match_score)
          .slice(0, 20)
          .map((candidate, index) => ({
            interviewId: `INT-${String(index + 1).padStart(3, '0')}`,
            candidate: {
              name: candidate.candidate_name,
              email: candidate.contact_info.email,
              phone: candidate.contact_info.phone,
              matchScore: candidate.match_score,
              experienceLevel: candidate.experience_level
            },
            interview: {
              title: 'Technical Interview',
              description: `Technical interview for ${candidate.experience_level} position`,
              interviewer: 'Rajnish Pandey',
              interviewerEmail: 'rajnish.pandey@company.com',
              defaultTime: '09:00',
              status: 'Scheduled',
              type: 'Video Call',
              duration: 60,
              preparationNotes: `Focus areas: ${candidate.matched_skills.join(', ')}`
            }
          }))
      }
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    this.downloadFile(blob, 'resume-analysis-complete.json');
  }

  private static downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private static getScoreClass(score: number): string {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-strong';
    if (score >= 60) return 'score-moderate';
    return 'score-weak';
  }
}