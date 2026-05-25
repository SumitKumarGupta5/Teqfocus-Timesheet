/* eslint-disable */
const fs = require('fs');
const path = require('path');

const userId = '650c41f9-83d8-4b6b-8ebc-f26ce5831383';

// Project IDs
const PROJECTS = {
  mern: 'f7adb53d-094d-4ed3-863d-da4730448deb', // MERN Stack Project
  sf_admin: '515ad7e4-a792-4c21-b829-981f097a86ce', // Salesforce Admin Project
  sf_dev: '7c94beac-58fb-4798-a4c4-1ead608297b7', // Salesforce Development Project
  internal: 'aadeed81-040e-41e2-b55a-d9a8616cfd2b' // Internal Tooling
};

// Descriptions meticulously sized between 50 and 70 words
const DESCRIPTIONS = {
  training_claude: [
    "Completed introductory training sessions on Claude models, thoroughly analyzing their capabilities and limitations in full-stack web development. Focused on system prompting, temperature configuration, context window management, and handling structured JSON outputs. Evaluated a series of code generation tasks to establish a clear baseline for AI-driven coding workflows across different projects.",
    "Explored advanced prompt engineering patterns including few-shot learning and chain-of-thought prompting. Applied these advanced techniques to generate complex database queries and responsive UI components, ensuring high-quality, production-ready outputs. Documented the optimal parameters for deterministic code generation models to share with team members, ensuring consistent developer output.",
    "Integrated Claude's API into an experimental CLI tool, developing custom system instructions for automated unit test generation. Addressed complex issues related to context window optimization, rate limiting, and API response latency. Tested the tool against multiple codebase schemas to ensure generalizability and robust error handling.",
    "Researched agentic coding workflows, studying multi-agent systems, memory persistence, and task decomposition frameworks. Created a simple coordinator agent that delegates code-review and bug-fixing tasks to specialized sub-agents. Analyzed performance bottlenecks in iterative prompt chains, documenting strategies to minimize token consumption and improve execution speed across all modules.",
    "Conducted validation experiments on AI coding agents, measuring code correctness, compliance, and execution safety. Configured runtime sandboxes using Docker containers to securely execute and test generated scripts. Logged error rates and exceptions to refine prompt templates for higher accuracy in automated coding loops, decreasing syntax errors significantly."
  ],
  mern_timesheet: [
    "Initiated the database schema design for the full stack employee timesheet tracker application. Defined relational tables for user profiles, daily work logs, and active projects, implementing foreign keys and check constraints. Wrote initial migration scripts to bootstrap the database in PostgreSQL, ensuring data integrity from the start.",
    "Developed the backend API endpoints for the timesheet tracker using Node.js and Express. Created secure routes for user authentication, daily log retrieval, and timesheet submission. Implemented request validation middleware to ensure data integrity before database insertion, protecting the database against malformed request payloads and unauthorized modifications.",
    "Configured Supabase Row Level Security (RLS) policies on the work_logs and profiles tables. Enforced strict data boundaries so users can only read and write their own timesheet entries, while allowing managers broad read access. Verified policy enforcement using automated database test suites under different roles.",
    "Built the core React components for the timesheet dashboard, including weekly calendar grids and responsive log entry forms. Managed state transitions using custom React hooks and synchronized UI updates with background network fetches for a smooth user experience. Applied styling with Tailwind CSS for layout consistency.",
    "Integrated the frontend dashboard with the Supabase client, enabling real-time synchronization of work log edits. Addressed race conditions in state updates during rapid user input, implementing debouncing on the form fields. Styled the elements using utility classes for a clean, accessible layout, complying with WCAG guidelines for color contrast.",
    "Implemented a dynamic weekly goal tracker on the dashboard, displaying progress bars and hours remaining. Added logic to calculate weekly aggregates dynamically on the client, caching calculations to prevent redundant re-renders of list components. Refactored utility helper functions to optimize layout rendering times, showing instant updates upon entry additions.",
    "Created custom validation guards for timesheet submissions, preventing logs exceeding 24 hours per day or negative values. Handled edge cases like daylight saving transitions and local time zone discrepancies. Displayed user-friendly error banners on validation failure to guide the employee during data input, preventing database integrity exceptions.",
    "Optimized data-fetching queries by implementing eager loading of project names and user profile information. Reduced database roundtrips by batching queries and caching static project lists. Verified response times using Chrome developer tools, showing a thirty percent reduction in dashboard load latency and improving backend database query performance."
  ],
  internal_tooling: [
    "Developed helper scripts to automate the bulk generation of mock work logs for system staging. Included parameters for date ranges, categories, and varying hours. Verified that generated data respects all database schema constraints, testing the database ingestion limits under simulated peak loads during staging deployments, improving initial onboarding setups.",
    "Built an internal admin panel allowing managers to configure project color codes and toggle project active states. Connected the UI controls to Supabase RPC functions, enforcing manager role checks server-side for authorization. Handled state updates smoothly using transition hooks to provide immediate visual feedback on settings changes.",
    "Configured a CI/CD pipeline script to automatically deploy database migrations to the Supabase staging project upon merging pull requests. Set up slack notifications to alert the team of successful migration runs, detailing the specific migration files applied and any performance warnings raised during execution.",
    "Created an automated log auditing script that flags profiles with missing logs or weekly hours below their set goals. Configured a cron job to run the audit weekly and output findings in formatted markdown files, which are automatically sent to managers via email.",
    "Designed a custom CSV export utility allowing users to download their monthly log history. Handled special character escaping, null values, and date formatting to ensure compatibility with standard spreadsheet applications. Optimized search query operations to retrieve data efficiently before formatting the export payload, minimizing server memory utilization."
  ],
  sf_admin: [
    "Initialized the custom object schema for the Salesforce-based Employee Referral Management app. Created custom objects for Referrals, Job Openings, and Candidates. Configured master-detail relationships and lookup fields to link objects securely, ensuring referrers can track candidate progress without accessing sensitive profile fields or salary details.",
    "Set up Profiles and Permission Sets to control data access within the referral application. Defined object-level CRUD permissions and field-level security for recruiters, employees, and administrators. Verified accessibility settings using login-as testing to ensure users only see fields relevant to their role, following least privilege principles.",
    "Configured sharing rules and organization-wide defaults (OWD) for referrals, restricting visibility so employees can only see referrals they submitted. Recruiter access was set to public read-write to manage candidates effectively. Tested record access across multiple test users to confirm sharing settings behave correctly under different role hierarchies.",
    "Created Salesforce Page Layouts for Referrals and Job Openings, organizing fields logically and setting key fields as read-only. Added dynamic actions and related lists to display candidate status transitions directly on the layout, streamlining the review process for recruiting coordinators during candidate review.",
    "Developed a Salesforce Flow to automate candidate notifications. Configured the flow to send email alerts to referring employees when a candidate's application status updates. Tested flow execution using debug logs to verify that notifications trigger only on relevant status changes, avoiding spam.",
    "Built dynamic reports and dashboards in Salesforce to track referral conversion rates and hiring bottlenecks. Grouped data by referring department and source. Configured scheduled email reports for executive stakeholders, providing them with weekly insights on referral channel effectiveness and cost per hire."
  ],
  sf_dev: [
    "Developed Apex Triggers to automate referral bonus calculations when a candidate is marked as hired. Handled bulk processing limits and wrote test classes to ensure code safety and cover edge cases, ensuring transaction rollback occurs on calculation failures to maintain financial data consistency across the entire database.",
    "Implemented a custom REST API endpoint in Apex to receive job referrals from external web forms. Enforced secure request parsing and user authentication. Handled exceptions by logging error details to a custom log object, facilitating easy debugging for system administrators during API payload issues.",
    "Built a Lightning Web Component (LWC) dashboard for employees to track their referral history. Designed the layout using Salesforce Lightning Design System (SLDS) for a native look, incorporating pagination, search filters, and responsive grids for desktop and mobile devices, ensuring high design fidelity.",
    "Connected the LWC dashboard to Apex controllers, securing data access by enforcing 'with sharing' keywords. Handled asynchronous server calls using promises and implemented toast messages for user feedback on actions, displaying meaningful success and error messages based on database results and permission configurations.",
    "Wrote comprehensive Apex unit tests for the referral triggers and controllers, mocking database transactions. Verified that all execution paths are covered and ensured test suites execute successfully under platform limits, maintaining code coverage above ninety percent for deployment readiness and platform compliance.",
    "Developed an LWC component for recruiters to review and score referrals in a unified interface. Integrated custom search logic and keyboard shortcuts to optimize recruiter workflow efficiency during review cycles, reducing screen transition times for high-volume hiring teams and recruiters.",
    "Implemented Salesforce validation rules and Apex before-insert validations to enforce referral submission policies. Ensured candidates cannot be referred for closed jobs. Wrote unit tests to verify constraint violations and prevent duplicate entries in the candidate database."
  ]
};

// Validate word counts
console.log('Validating word counts...');
let invalidCount = 0;
for (const key in DESCRIPTIONS) {
  DESCRIPTIONS[key].forEach((desc, idx) => {
    const wordCount = desc.split(/\s+/).filter(Boolean).length;
    if (wordCount < 50 || wordCount > 70) {
      console.warn(`WARNING: ${key}[${idx}] has word count ${wordCount}: "${desc}"`);
      invalidCount++;
    }
  });
}
if (invalidCount > 0) {
  console.error(`Validation failed: ${invalidCount} descriptions do not have 50-70 words.`);
  process.exit(1);
} else {
  console.log('All descriptions validated successfully (50-70 words).');
}

// Generate all dates from April 1, 2026 to May 19, 2026
const startDate = new Date('2026-04-01');
const endDate = new Date('2026-05-19');
const dateList = [];

let curr = new Date(startDate);
while (curr <= endDate) {
  dateList.push(new Date(curr));
  curr.setDate(curr.getDate() + 1);
}

const entries = [];

// Track index to alternate descriptions naturally
let indices = {
  training: 0,
  mern: 0,
  internal: 0,
  sf_admin: 0,
  sf_dev: 0
};

let weekdayIndex = 0; // use to track weekday index for alternating descriptions cleanly
dateList.forEach((dateObj) => {
  const day = dateObj.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = (day === 0 || day === 6);
  
  if (isWeekend) {
    // Skip weekends entirely
    return;
  }

  const dateStr = dateObj.toISOString().split('T')[0];
  
  // Decide category and project based on date phase
  let category = 'on_project';
  let projectId = null;
  let description = '';
  
  // Weekday hours: 6 to 8 hours variable (6, 6.5, 7, 7.5, 8)
  const hours = [6, 6.5, 7, 7.5, 8][(weekdayIndex % 5)];

  // Phase allocation
  if (dateObj <= new Date('2026-04-12')) {
    // April 1 to April 12: Training on Claude/AI agents + MERN Stack timesheet tracker
    if (weekdayIndex % 3 === 0) {
      category = 'training';
      projectId = PROJECTS.mern;
      description = DESCRIPTIONS.training_claude[indices.training % DESCRIPTIONS.training_claude.length];
      indices.training++;
    } else {
      category = 'on_project';
      projectId = PROJECTS.mern;
      description = DESCRIPTIONS.mern_timesheet[indices.mern % DESCRIPTIONS.mern_timesheet.length];
      indices.mern++;
    }
  } else if (dateObj <= new Date('2026-04-24')) {
    // April 13 to April 24: Internal Tooling + Shadowing on MERN/Internal Tooling
    if (weekdayIndex % 3 === 0) {
      category = 'shadow';
      projectId = PROJECTS.internal;
      // Combine custom shadowing prefix with base internal tooling description to ensure it flows nicely
      description = `Shadowed senior engineers working on integrated testing protocols for the internal tooling portal. ${DESCRIPTIONS.internal_tooling[indices.internal % DESCRIPTIONS.internal_tooling.length]}`;
      indices.internal++;
    } else {
      category = 'on_project';
      projectId = PROJECTS.internal;
      description = DESCRIPTIONS.internal_tooling[indices.internal % DESCRIPTIONS.internal_tooling.length];
      indices.internal++;
    }
  } else if (dateObj <= new Date('2026-05-05')) {
    // April 25 to May 5: Salesforce Admin Project
    if (weekdayIndex % 4 === 0) {
      category = 'training';
      projectId = PROJECTS.sf_admin;
      description = `Underwent advanced admin enablement. ${DESCRIPTIONS.sf_admin[indices.sf_admin % DESCRIPTIONS.sf_admin.length]}`;
      indices.sf_admin++;
    } else {
      category = 'on_project';
      projectId = PROJECTS.sf_admin;
      description = DESCRIPTIONS.sf_admin[indices.sf_admin % DESCRIPTIONS.sf_admin.length];
      indices.sf_admin++;
    }
  } else {
    // May 6 to May 19: Salesforce Development Project
    if (weekdayIndex % 4 === 0) {
      category = 'shadow';
      projectId = PROJECTS.sf_dev;
      description = `Observed design reviews of Apex optimization plans. ${DESCRIPTIONS.sf_dev[indices.sf_dev % DESCRIPTIONS.sf_dev.length]}`;
      indices.sf_dev++;
    } else {
      category = 'on_project';
      projectId = PROJECTS.sf_dev;
      description = DESCRIPTIONS.sf_dev[indices.sf_dev % DESCRIPTIONS.sf_dev.length];
      indices.sf_dev++;
    }
  }

  // Double check description length dynamically for the generated entries
  const generatedWordCount = description.split(/\s+/).filter(Boolean).length;
  if (generatedWordCount < 50 || generatedWordCount > 75) {
    console.warn(`WARNING: Generated entry for ${dateStr} has ${generatedWordCount} words.`);
  }

  entries.push({
    date: dateStr,
    hours: hours.toFixed(2),
    category: category,
    project_id: projectId,
    description: description
  });

  weekdayIndex++;
});

// Construct SQL query
let sql = '-- Seeding work logs for sumit@employee.com\n';
sql += 'INSERT INTO public.work_logs (user_id, project_id, date, hours, category, description) VALUES\n';

const valueStrings = entries.map(entry => {
  const descEscaped = entry.description.replace(/'/g, "''");
  return `('${userId}', '${entry.project_id}', '${entry.date}', ${entry.hours}, '${entry.category}', '${descEscaped}')`;
});

sql += valueStrings.join(',\n') + ';\n';

fs.writeFileSync(path.join(__dirname, 'seed_logs.sql'), sql);
console.log(`Generated ${entries.length} weekday log entries in seed_logs.sql`);
