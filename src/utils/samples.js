/**
 * Sample Emails for Inbox Autopsy
 * All examples use fictional details only.
 */

/**
 * Weak/Generic Outreach - Low scores across the board
 */
export const SAMPLE_WEAK = `Hi,

I wanted to reach out to you about our amazing product that can help your business grow exponentially. We are the best in the industry and guarantee amazing results with no risk.

Let me know if you're interested in a demo, trial, or consultation. I'm very flexible and can work around your schedule.

Thanks,
John Smith
VP of Sales
Amazing Solutions Inc.`;

export const SAMPLE_WEAK_LABEL = 'Weak: Generic, spammy, no personalization';

/**
 * Average Outreach - Some strengths, room for improvement
 */
export const SAMPLE_AVERAGE = `Hi there,

I hope you're doing well. I came across TechFlow's recent Series B announcement and thought I'd reach out.

We've helped companies like DataStream and CloudScale improve their deployment pipeline efficiency by up to 40%. Our platform integrates with your existing CI/CD tools and provides real-time visibility.

Would you be open to a quick call next week to discuss how this might fit your current roadmap?

Best regards,
Sarah Chen
Senior Account Executive
DeployFast
sarah@deployfast.io`;

export const SAMPLE_AVERAGE_LABEL = 'Average: Some personalization, decent credibility, could be more concise';

/**
 * Strong Outreach - High scores, concise, specific
 */
export const SAMPLE_STRONG = `Hi Marcus,

Congrats on the Product Hunt launch of AnalyticsPro — the real-time cohort feature looks great.

We helped MetricLab (similar B2B SaaS, 200+ employees) reduce churn 23% in 90 days by adding behavioral email triggers. Since you're scaling the analytics dashboard, thought the playbook might be useful.

Open to a 15-min call Thursday to walk through it? Happy to send a 3-min Loom instead if that's easier.

Best,
Priya
Growth at ScaleFlow
priya@scaleflow.io`;

export const SAMPLE_STRONG_LABEL = 'Strong: Personalized, specific metrics, clear low-friction CTA';

/**
 * All samples as an array for easy iteration
 */
export const SAMPLES = [
  { id: 'weak', label: SAMPLE_WEAK_LABEL, content: SAMPLE_WEAK },
  { id: 'average', label: SAMPLE_AVERAGE_LABEL, content: SAMPLE_AVERAGE },
  { id: 'strong', label: SAMPLE_STRONG_LABEL, content: SAMPLE_STRONG },
];

/**
 * Get a sample by ID
 */
export function getSample(id) {
  return SAMPLES.find(s => s.id === id);
}