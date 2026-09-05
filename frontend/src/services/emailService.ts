import { Candidate } from '../types';

export interface EmailTemplate {
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'formal';
}

export class EmailService {
  private static generateInterviewEmail(candidate: Candidate, jobTitle: string = 'Software Developer'): EmailTemplate {
    const candidateName = candidate.candidate_name;
    const matchScore = candidate.match_score;
    const experience = candidate.experience_years;
    const topSkills = candidate.matched_skills.slice(0, 3).join(', ');
    
    // Generate personalized subject based on match score
    let subject = '';
    if (matchScore >= 90) {
      subject = `🌟 Exceptional Match - Interview Invitation for ${jobTitle} Position`;
    } else if (matchScore >= 80) {
      subject = `Interview Invitation - ${jobTitle} Position at TechCorp`;
    } else {
      subject = `Interview Opportunity - ${jobTitle} Role`;
    }

    // Generate personalized email body
    const body = `Dear ${candidateName},

I hope this email finds you well. I am writing to express our strong interest in your candidacy for the ${jobTitle} position at TechCorp Solutions.

🎯 **Why We're Excited About You:**
After conducting an AI-powered analysis of your resume, you achieved an impressive ${matchScore}% match score with our requirements. Your ${experience} years of experience and expertise in ${topSkills} particularly caught our attention.

${this.generatePersonalizedContent(candidate, matchScore)}

📅 **Next Steps:**
We would love to schedule an interview to discuss how your skills and experience align with our team's goals. The interview process will include:

• Initial technical discussion (45 minutes)
• Team culture fit conversation (30 minutes)
• Q&A session about the role and company (15 minutes)

🕒 **Scheduling:**
Please reply to this email with your availability for the next week, and we'll coordinate a time that works best for both parties. We offer flexible scheduling options including:
- In-person interviews at our San Francisco office
- Virtual interviews via Google Meet or Zoom
- Hybrid options based on your preference

💼 **What We Offer:**
• Competitive salary range: ${candidate.salary_range || '$100,000 - $150,000'}
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements (remote/hybrid options)
• Professional development budget and conference attendance
• Equity participation and performance bonuses
• Collaborative and innovative work environment

${this.generateClosingMessage(matchScore)}

Looking forward to hearing from you soon!

Best regards,

Sarah Johnson
Senior Technical Recruiter
TechCorp Solutions
📧 sarah.johnson@techcorp.com
📱 +1 (555) 123-4567
🌐 www.techcorp.com

---
This email was generated using AI-powered candidate analysis. Your privacy is important to us - this communication is confidential and intended solely for the named recipient.`;

    return {
      subject,
      body,
      tone: matchScore >= 85 ? 'friendly' : 'professional'
    };
  }

  private static generatePersonalizedContent(candidate: Candidate, matchScore: number): string {
    if (matchScore >= 90) {
      return `Your profile demonstrates exceptional alignment with our requirements. ${candidate.strengths.length > 0 ? `We're particularly impressed by your ${candidate.strengths[0].toLowerCase()}.` : ''} Based on our analysis, you would be an outstanding addition to our engineering team.`;
    } else if (matchScore >= 80) {
      return `Your background shows strong potential for this role. ${candidate.notable_companies.length > 0 ? `Your experience at ${candidate.notable_companies[0]} adds significant value to your candidacy.` : ''} We believe you could make a meaningful contribution to our projects.`;
    } else if (matchScore >= 70) {
      return `We see great potential in your profile and believe this role could be an excellent opportunity for mutual growth. Your technical foundation aligns well with our team's direction.`;
    } else {
      return `While there are some areas where additional experience would be beneficial, we're interested in discussing how your unique background could contribute to our team's success.`;
    }
  }

  private static generateClosingMessage(matchScore: number): string {
    if (matchScore >= 90) {
      return `Given your exceptional qualifications, we're prioritizing your application and would like to move quickly through the interview process. We're confident this could be the perfect opportunity for both of us!`;
    } else if (matchScore >= 80) {
      return `We're excited about the possibility of you joining our team and contributing to our innovative projects. This role offers excellent growth opportunities that align with your career trajectory.`;
    } else {
      return `We appreciate your interest in TechCorp and look forward to learning more about your goals and how we might work together.`;
    }
  }

  static async sendInterviewEmail(candidate: Candidate, jobTitle?: string): Promise<boolean> {
    try {
      const emailTemplate = this.generateInterviewEmail(candidate, jobTitle);
      
      // Create mailto link with pre-filled content
      const mailtoLink = `mailto:${candidate.contact_info.email}?subject=${encodeURIComponent(emailTemplate.subject)}&body=${encodeURIComponent(emailTemplate.body)}`;
      
      // Open default email client
      window.open(mailtoLink);
      
      // Log the email generation for analytics
      console.log('Interview email generated for:', candidate.candidate_name);
      
      return true;
    } catch (error) {
      console.error('Failed to generate interview email:', error);
      return false;
    }
  }

  static generateEmailPreview(candidate: Candidate, jobTitle?: string): EmailTemplate {
    return this.generateInterviewEmail(candidate, jobTitle);
  }

  static async copyEmailToClipboard(candidate: Candidate, jobTitle?: string): Promise<boolean> {
    try {
      const emailTemplate = this.generateInterviewEmail(candidate, jobTitle);
      const fullEmail = `Subject: ${emailTemplate.subject}\n\n${emailTemplate.body}`;
      
      await navigator.clipboard.writeText(fullEmail);
      return true;
    } catch (error) {
      console.error('Failed to copy email to clipboard:', error);
      return false;
    }
  }

  static validateEmailAddress(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static formatEmailForDisplay(email: string): string {
    return email.length > 30 ? `${email.substring(0, 27)}...` : email;
  }
}