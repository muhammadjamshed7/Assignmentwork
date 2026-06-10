export const placeholderGuide = [
  {
    token: "[SUBJECT]",
    description:
      "replace with the subject name, for example Cybersecurity, Marketing, Civil Engineering, Business Management, Computer Science, etc.",
  },
  {
    token: "[ASSIGNMENT_TITLE]",
    description: "replace with the exact title of the assignment.",
  },
  {
    token: "[WORD_COUNT]",
    description: "replace with the required word count.",
  },
  {
    token: "[CITATION_STYLE]",
    description:
      "replace with the required referencing style, for example APA 7th, Harvard, MLA, IEEE, or Chicago.",
  },
  {
    token: "[ACADEMIC_LEVEL]",
    description:
      "replace with the level, for example undergraduate, postgraduate, master's, PhD, diploma, or college level.",
  },
]

export const unknownAssignmentPrompt = `Unknown Assignment Workflow

Use this workflow when a student or user submits an assignment that is unfamiliar, unclear, incomplete, or being handled for the first time. Do not start writing, solving, coding, or preparing the final answer immediately. First analyze the assignment, break it down, identify required tools, and create a proper step-by-step workflow.

Follow this process:

1. Identify the Subject
Determine the subject or academic domain of the assignment, such as Cybersecurity, Networking, Programming, Database Systems, Artificial Intelligence, Web Development, Operating Systems, Cloud Computing, Research Writing, Business, or Management.

2. Ask for or Read the Assignment Brief
Require the complete assignment brief before starting. Check for the assignment title, full question or problem statement, marking rubric, required format, submission guidelines, required tools or software, deadline, attached files, screenshots, datasets, and instructor notes.

3. Break Down the Assignment
Divide the assignment into clear, manageable sections. Explain what the assignment is asking, the main tasks, theoretical parts, practical or technical parts, required screenshots or evidence, required files or outputs, and final submission deliverables.

4. Identify Required Tools
List all required tools after understanding the assignment. Consider writing tools, presentation tools, coding tools, technical tools, and research tools such as Microsoft Word, Google Docs, PowerPoint, Canva, VS Code, Python, Java, C++, GitHub, Kali Linux, Wireshark, Cisco Packet Tracer, MySQL, Docker, VirtualBox, VMware, Linux Terminal, Google Scholar, IEEE Xplore, official documentation, and academic databases.

5. Map Tools to Assignment Tasks
Explain which tool will be used for each part of the assignment. Include the tool name, purpose of the tool, assignment section where it is needed, and expected output from that tool.

6. Create a Step-by-Step Technical Workflow
If any technical tool is required, generate a beginner-friendly practical workflow. For example, if Kali Linux is required, explain how to open Kali Linux, select the required tool or terminal, run the required command, upload or import the required file, configure settings, execute the task, capture screenshots, save or export output, and add the result to the final assignment document.

7. Prepare the Final Assignment Structure
Before creating the assignment, suggest the final structure. Example: Title Page, Introduction, Objectives, Assignment Breakdown, Tools Used, Methodology, Step-by-Step Implementation, Screenshots or Evidence, Results, Discussion, Conclusion, References, and Appendix if required.

8. Confirm Final Deliverables
Clearly list what needs to be submitted, such as Word document, PDF file, PowerPoint presentation, source code, screenshots, lab report, dataset, configuration files, GitHub link, or video demonstration.

9. Start Assignment Creation Only After Planning
Begin final assignment creation only after the subject is identified, the assignment is broken down, tools are selected, a technical workflow is prepared, the final structure is confirmed, and deliverables are listed.

Mandatory output format:

1. Assignment Understanding
2. Subject / Domain
3. Complete Task Breakdown
4. Required Tools
5. Tool-to-Task Mapping
6. Step-by-Step Technical Workflow
7. Final Assignment Structure
8. Deliverables Checklist
9. Next Action Plan

Rule:
Never directly start an unknown assignment. Every unfamiliar assignment must first pass through the Unknown Assignment Workflow so the output is accurate, structured, tool-specific, and aligned with academic requirements.`

export const toolsInstallationPrompt = `Tools Installation Workflow

Use this standalone sub-workflow whenever an assignment requires installing, setting up, configuring, selecting, or using a technical tool, software platform, programming environment, notebook, data analysis system, cybersecurity tool, database tool, visualization tool, or development platform.

Core rule:
Do not directly start the assignment when a tool is required. First create a clear tool installation and setup workflow that helps the user decide which tool is required, whether it must be installed locally, whether the work can be completed online, which alternatives are available, which workflow applies, and what screenshots, outputs, or files are required for submission.

Trigger examples:
- Power BI, Tableau, Excel, SPSS, R, Python, Jupyter Notebook, Google Colab
- Kali Linux, Wireshark, Nmap, Metasploit, Cisco Packet Tracer, GNS3
- MySQL, PostgreSQL, MongoDB, Supabase
- VS Code, PyCharm, GitHub, Docker, VirtualBox, VMware
- Any software installation, setup, configuration, or tool-selection requirement

Tool category decision flow:
Assignment Received
-> Is it Data Analysis?
   -> Use Excel / Power BI / Tableau / R / Python / SPSS
-> Is it Programming?
   -> Use VS Code / Jupyter Notebook / Google Colab / IDE
-> Is it R Language?
   -> Use RStudio / Google Colab / Jupyter Notebook / R Console
-> Is it Python or Notebook Based?
   -> Use Jupyter Notebook / Google Colab / VS Code
-> Is it Cybersecurity?
   -> Use Kali Linux / Wireshark / Nmap / Metasploit
-> Is it Networking?
   -> Use Cisco Packet Tracer / Wireshark / GNS3
-> Is it Database?
   -> Use MySQL / PostgreSQL / MongoDB / Supabase
-> Is it Visualization?
   -> Use Power BI / Tableau / Excel / Python Libraries
-> Is it Report Writing?
   -> Use MS Word / Google Docs / PDF Export Tool

General workflow:
Receive Assignment
-> Identify Assignment Type
-> Identify Required Tool
-> Check Whether Tool Is Local or Online
-> Choose Best Working Option
-> Install / Open / Access Tool
-> Configure Required Settings
-> Upload Dataset or Create Project
-> Run Required Task
-> Check Output
-> Capture Evidence
-> Export Final Files
-> Add Results to Assignment Document
-> Submit Assignment

Required output format:

1. Assignment Type
Identify the academic or technical category of the assignment.

2. Required Tool
State the main tool, software, platform, language, or environment required by the brief.

3. Alternative Tools
List practical alternatives, including online options where suitable.

4. Recommended Tool
Choose the best option for the user.

5. Reason for Recommendation
Explain why the recommended tool is best for the assignment, user skill level, system requirements, and submission format.

6. Installation or Access Method
Explain whether the tool should be installed locally or accessed online. Include the safest official source or platform.

7. Configuration Steps
List setup steps such as installing packages, selecting runtime, creating a project, importing a dataset, connecting a database, or configuring a VM.

8. Arrow-Based Workflow
Write the full process in connected arrow format from assignment requirement to final submission.

9. Expected Output
Describe the result the tool should produce, such as charts, dashboard, code output, notebook cells, query results, terminal output, report, or exported file.

10. Screenshots or Evidence Required
List screenshots, command outputs, dashboard views, notebook outputs, query results, or configuration evidence that should be captured.

11. Final Submission Files
List all files the student should submit, such as .ipynb, .py, .R, .pbix, .sql, PDF, Word document, screenshots, dataset, GitHub link, or exported report.

Tool-specific workflow examples:

RStudio:
Receive R Assignment
-> Identify Required R Task
-> Download R from Official CRAN Website
-> Install R
-> Download RStudio Desktop
-> Install RStudio
-> Open RStudio
-> Create New R Script or R Markdown File
-> Install Required Packages
-> Import Dataset
-> Run R Code
-> Generate Tables / Graphs / Output
-> Capture Screenshots
-> Export Script / Report / PDF
-> Add Results to Assignment
-> Submit Final Work

Google Colab:
Receive Coding or Data Analysis Assignment
-> Open Google Colab
-> Create New Notebook
-> Select Required Runtime
-> Upload Dataset or Mount Google Drive
-> Install Required Libraries
-> Write Code in Cells
-> Run Code Step by Step
-> Check Output
-> Add Explanation in Markdown Cells
-> Download Notebook as .ipynb or PDF
-> Add Results to Assignment Report
-> Submit Final Work

Power BI:
Receive Power BI Assignment
-> Identify Required Dataset
-> Download Power BI Desktop
-> Install Power BI Desktop
-> Open Power BI
-> Import Dataset
-> Clean Data in Power Query
-> Create Data Model
-> Create Charts / Dashboard
-> Add Required Visuals
-> Verify Insights
-> Capture Dashboard Screenshots
-> Export PDF or Save PBIX File
-> Add Dashboard Explanation to Report
-> Submit Final Work

Jupyter Notebook:
Receive Notebook Assignment
-> Identify Programming Language
-> Choose Jupyter Notebook / JupyterLab / Anaconda
-> Install Anaconda or Python
-> Open Jupyter Notebook
-> Create New Notebook
-> Install Required Libraries
-> Upload Dataset
-> Write Code in Cells
-> Run Cells Step by Step
-> Check Output After Each Cell
-> Add Markdown Explanations
-> Generate Charts / Tables / Results
-> Restart Kernel and Run All Cells
-> Export Notebook as .ipynb / HTML / PDF
-> Submit Notebook and Supporting Files

Python:
Receive Python Assignment
-> Identify Python Task
-> Choose Tool: VS Code / Jupyter Notebook / Google Colab / PyCharm
-> Install Python
-> Install Code Editor or Notebook Tool
-> Create Project Folder
-> Install Required Libraries
-> Add Dataset or Input File
-> Write Python Code
-> Run Code
-> Test Output
-> Fix Errors
-> Capture Output Screenshots
-> Save Source Code
-> Add Explanation to Report
-> Submit Final Files

Cybersecurity:
Receive Cybersecurity Assignment
-> Identify Required Security Task
-> Select Tool: Kali Linux / Nmap / Wireshark / Metasploit
-> Check Whether VM Is Required
-> Install VirtualBox or VMware
-> Install or Open Kali Linux
-> Update System Packages
-> Install Required Tool
-> Configure Target / Input File
-> Run Required Command
-> Review Output
-> Capture Terminal Screenshot
-> Explain Findings
-> Add Evidence to Report
-> Submit Final Work

Database:
Receive Database Assignment
-> Identify Database Requirement
-> Select Tool: MySQL / PostgreSQL / MongoDB / Supabase
-> Install Database Tool or Use Online Platform
-> Create Database
-> Create Tables or Collections
-> Insert Data
-> Run Queries
-> Check Output
-> Capture Query Results
-> Export SQL / Screenshots / Report
-> Add Explanation to Assignment
-> Submit Final Work

Final rule:
Whenever a tool is required, always produce the installation/setup decision first, then the connected arrow workflow, then the evidence and final submission checklist.`

export const essayTopicSelectionPrompt = `I have received an essay assignment. I will share the assessment brief and marking criteria with you.

Your task is to help me select the strongest essay topic based on the brief and criteria - do not start writing the essay yet.

Step 1: Read the brief and identify: module name, word count, submission format, and whether the topic is fixed or open.

Step 2: Extract the marking criteria and note the weighting of each component (critical analysis, argument, referencing, research depth, etc.).

Step 3: If the topic is open, generate 3 to 5 specific and researchable topic options relevant to the module.

Step 4: Evaluate each topic option against the marking criteria. Score each one based on how well it allows high marks in each criterion.

Step 5: Recommend the strongest topic with a clear justification.

Step 6: Write a focused academic essay question for the selected topic.

Step 7: Confirm the scope - what the essay will cover, what it will exclude, the main argument, the required referencing style, and 3 to 5 suggested academic sources to begin with.

Present the output in this format:
1. Selected Topic
2. Essay Question
3. Marking Criteria Alignment (table: criterion | how this topic addresses it)
4. Scope and Boundaries
5. Suggested Starting Sources

Here is the assessment brief and marking criteria:
[PASTE BRIEF AND CRITERIA HERE]`

export const dissertationTopicSelectionPrompt = `I have received a dissertation assignment. I will share the assessment brief and marking criteria with you.

Your task is to help me select the strongest dissertation topic and plan the research - do not start writing any chapter yet.

Step 1: Read the brief and identify: degree subject, word count, required chapter structure, research type (primary, secondary, or mixed), and deadline pressure.

Step 2: Extract the marking criteria and note the weighting of each component (literature review, methodology, critical analysis, originality, presentation, etc.).

Step 3: Identify the required research type and flag any feasibility risks such as ethics approval requirements or limited source availability.

Step 4: Generate 3 to 5 specific dissertation topic options relevant to the degree subject.

Step 5: Run a feasibility check on each topic - assess available academic sources, practical research method, scope manageability within the word count, and originality.

Step 6: Recommend the strongest topic with full justification.

Step 7: Write a formal dissertation title (10 to 15 words, academic tone) and one main research question with 2 to 3 sub-questions.

Step 8: Produce a chapter outline - one sentence describing the purpose of each chapter: Introduction, Literature Review, Methodology, Findings, Discussion, Conclusion.

Step 9: Recommend the research methodology (qualitative, quantitative, or mixed; primary or secondary) and justify the choice based on the brief requirements.

Present the output in this format:
1. Selected Topic and Justification
2. Dissertation Title
3. Research Questions (main + sub-questions)
4. Marking Criteria Alignment (table: criterion | how this topic addresses it)
5. Chapter Outline
6. Research Methodology Recommendation
7. Key Starting Sources (5 to 8 academic references)

Here is the assessment brief and marking criteria:
[PASTE BRIEF AND CRITERIA HERE]`

const essayTopicSelectionSteps = {
  purpose:
    "Use this workflow before starting any essay assignment. It forces topic selection and planning based on the assessment brief and marking criteria before any writing begins.",
  whenToUse: [
    "When the essay topic is open and needs to be selected.",
    "When the brief includes marking criteria that must be aligned to the topic.",
    "When the writer needs to confirm scope and angle before starting.",
  ],
  steps: [
    {
      number: 1,
      title: "Read the Assessment Brief",
      details: "Identify the module name, word count, submission format, referencing style, and whether the topic is fixed or open.",
    },
    {
      number: 2,
      title: "Extract the Marking Criteria",
      details:
        "Note the weighting percentage for each criterion: critical analysis, argument structure, referencing, research depth, originality, and presentation.",
    },
    {
      number: 3,
      title: "Identify Topic Freedom Level",
      details: "If the topic is fixed by the brief, skip to Step 5. If the topic is open, continue to Step 4.",
    },
    {
      number: 4,
      title: "Generate 3 to 5 Topic Options",
      details:
        "Each topic must be specific (not too broad), researchable (academic sources exist), and aligned to the module learning outcomes.",
    },
    {
      number: 5,
      title: "Evaluate Each Topic Against Marking Criteria",
      details:
        "For each topic ask: Can this topic score high on critical analysis? Does it allow a strong argument structure? Are enough academic sources available? Is it within scope for the word count?",
    },
    {
      number: 6,
      title: "Select the Strongest Topic",
      details:
        "Choose the topic with the highest alignment to the marking criteria weightings and the best source availability.",
    },
    {
      number: 7,
      title: "Write a Focused Essay Question",
      details:
        "Use academic question stems: To what extent..., Critically analyse..., Evaluate the impact of..., Discuss the relationship between...",
    },
    {
      number: 8,
      title: "Confirm Scope and Angle",
      details:
        "State what the essay will cover, what it will exclude, the main argument or position, and the referencing style required.",
    },
    {
      number: 9,
      title: "Identify Key Starting Sources",
      details:
        "Find 3 to 5 academic sources - journal articles, books, or reports - directly relevant to the selected topic and essay question.",
    },
  ],
  mandatoryOutputFormat: [
    "Selected Topic",
    "Essay Question",
    "Marking Criteria Alignment (table: criterion | how this topic addresses it)",
    "Scope and Boundaries",
    "Suggested Starting Sources",
  ],
  promptBlock: {
    title: "Essay Topic Selection Prompt",
    subtitle: "Reusable prompt block. Copy it when you need this workflow.",
    content: `I have received an essay assignment. I will share the assessment brief and marking criteria with you.

Your task is to help me select the strongest essay topic based on the brief and criteria - do not start writing the essay yet.

Step 1: Read the brief and identify: module name, word count, submission format, and whether the topic is fixed or open.

Step 2: Extract the marking criteria and note the weighting of each component (critical analysis, argument, referencing, research depth, etc.).

Step 3: If the topic is open, generate 3 to 5 specific and researchable topic options relevant to the module.

Step 4: Evaluate each topic option against the marking criteria. Score each one based on how well it allows high marks in each criterion.

Step 5: Recommend the strongest topic with a clear justification.

Step 6: Write a focused academic essay question for the selected topic.

Step 7: Confirm the scope - what the essay will cover, what it will exclude, the main argument, the required referencing style, and 3 to 5 suggested academic sources to begin with.

Present the output in this format:
1. Selected Topic
2. Essay Question
3. Marking Criteria Alignment (table: criterion | how this topic addresses it)
4. Scope and Boundaries
5. Suggested Starting Sources

Here is the assessment brief and marking criteria:
[PASTE BRIEF AND CRITERIA HERE]`,
  },
}

const dissertationTopicSelectionSteps = {
  purpose:
    "Use this workflow before starting any dissertation. It forces topic selection, feasibility checking, and full research planning based on the assessment brief and marking criteria before any chapter is written.",
  whenToUse: [
    "When the dissertation topic needs to be selected or confirmed.",
    "When the brief includes marking criteria that must be aligned to the research.",
    "When the writer needs a chapter outline, research questions, and methodology decided before starting.",
  ],
  steps: [
    {
      number: 1,
      title: "Read the Dissertation Brief",
      details:
        "Identify the degree subject, word count, required chapter structure, research type (primary, secondary, or mixed), submission deadline, and any supervisor requirements.",
    },
    {
      number: 2,
      title: "Extract Marking Criteria and Weightings",
      details:
        "Note the weighting for each criterion: literature review, methodology, critical analysis, originality, argument, presentation, and referencing.",
    },
    {
      number: 3,
      title: "Identify Required Research Type",
      details:
        "Primary research (surveys, interviews) requires ethics approval time and participant access. Secondary research (existing literature and data) is faster and lower risk. Mixed methods combines both.",
    },
    {
      number: 4,
      title: "Run a Feasibility Check on Research Type",
      details:
        "Flag risks - does primary research require ethics approval? Are participants accessible? Is there enough academic literature for a secondary approach? Is the timeline realistic?",
    },
    {
      number: 5,
      title: "Generate 3 to 5 Dissertation Topic Options",
      details:
        "Each topic must be specific, researchable, original enough to contribute to the field, and relevant to the degree subject.",
    },
    {
      number: 6,
      title: "Evaluate Each Topic for Feasibility",
      details:
        "For each topic assess: Are academic sources available? Is the research method practical within the time frame? Is the scope manageable within the word count? Is there a risk of topic overlap with common submissions?",
    },
    {
      number: 7,
      title: "Select the Strongest Topic",
      details:
        "Choose the topic with the highest combination of feasibility score and marking criteria alignment.",
    },
    {
      number: 8,
      title: "Write the Dissertation Title and Research Questions",
      details:
        "Title should be 10 to 15 words, specific, and academic in tone. Write one main research question and 2 to 3 sub-questions that together cover the full scope.",
    },
    {
      number: 9,
      title: "Produce the Chapter Outline",
      details:
        "Write one sentence describing the purpose of each chapter: Introduction, Literature Review, Methodology, Findings, Discussion, Conclusion.",
    },
    {
      number: 10,
      title: "Confirm Research Methodology",
      details:
        "Decide between qualitative, quantitative, or mixed methods. Decide between primary and secondary. Justify the choice based on the research question and brief requirements.",
    },
    {
      number: 11,
      title: "Identify Key Starting Sources",
      details:
        "Find 5 to 8 peer-reviewed academic sources directly relevant to the selected topic and research questions.",
    },
  ],
  mandatoryOutputFormat: [
    "Selected Topic and Justification",
    "Dissertation Title",
    "Research Questions (main + sub-questions)",
    "Marking Criteria Alignment (table: criterion | how this topic addresses it)",
    "Chapter Outline",
    "Research Methodology Recommendation",
    "Key Starting Sources (5 to 8 academic references)",
  ],
  promptBlock: {
    title: "Dissertation Topic Selection Prompt",
    subtitle: "Reusable prompt block. Copy it when you need this workflow.",
    content: `I have received a dissertation assignment. I will share the assessment brief and marking criteria with you.

Your task is to help me select the strongest dissertation topic and plan the research - do not start writing any chapter yet.

Step 1: Read the brief and identify: degree subject, word count, required chapter structure, research type (primary, secondary, or mixed), and deadline pressure.

Step 2: Extract the marking criteria and note the weighting of each component (literature review, methodology, critical analysis, originality, presentation, etc.).

Step 3: Identify the required research type and flag any feasibility risks such as ethics approval requirements or limited source availability.

Step 4: Generate 3 to 5 specific dissertation topic options relevant to the degree subject.

Step 5: Run a feasibility check on each topic - assess available academic sources, practical research method, scope manageability within the word count, and originality.

Step 6: Recommend the strongest topic with full justification.

Step 7: Write a formal dissertation title (10 to 15 words, academic tone) and one main research question with 2 to 3 sub-questions.

Step 8: Produce a chapter outline - one sentence describing the purpose of each chapter: Introduction, Literature Review, Methodology, Findings, Discussion, Conclusion.

Step 9: Recommend the research methodology (qualitative, quantitative, or mixed; primary or secondary) and justify the choice based on the brief requirements.

Present the output in this format:
1. Selected Topic and Justification
2. Dissertation Title
3. Research Questions (main + sub-questions)
4. Marking Criteria Alignment (table: criterion | how this topic addresses it)
5. Chapter Outline
6. Research Methodology Recommendation
7. Key Starting Sources (5 to 8 academic references)

Here is the assessment brief and marking criteria:
[PASTE BRIEF AND CRITERIA HERE]`,
  },
}

const generalAssignmentWorkflowSteps = {
  purpose:
    "Use this workflow for any assignment where you have a brief and marking criteria. The AI reads the brief, builds a structured outline, gets your approval, then writes one section at a time - never all at once.",
  whenToUse: [
    "When you have received any assignment brief and need to start from scratch.",
    "When you want the AI to follow the brief and marking criteria exactly before writing.",
    "When you want full control - approving the outline before writing begins, and confirming each section before the next one starts.",
    "Works for any assignment type: essay, report, case study, reflection, dissertation chapter, literature review, and more.",
  ],
  steps: [
    {
      number: 1,
      title: "Analyse the Brief",
      details:
        "AI reads the full brief and marking criteria. Identifies assignment type, word count, subject, academic level, referencing style, and what scores highest in the marking criteria. Presents a summary and waits for confirmation before continuing.",
    },
    {
      number: 2,
      title: "Build the Outline",
      details:
        "AI creates a section-by-section outline with headings, one sentence per section describing what it covers, approximate word count per section, and which sections carry the most marks. Does not start writing until you approve the outline.",
    },
    {
      number: 3,
      title: "Write Section by Section",
      details:
        "After outline approval, AI writes one section at a time. After each section it states the word count, confirms it meets the marking criteria for that section, and asks for confirmation before moving to the next section.",
    },
    {
      number: 4,
      title: "Review and Complete",
      details:
        "After all sections are complete, AI asks if you want the full reference list added. Nothing is added without your instruction.",
    },
  ],
  mandatoryOutputFormat: [
    "Stage 1: Brief Analysis Summary",
    "Stage 2: Section-by-Section Outline with word count per section",
    "Stage 3: One section at a time with word count confirmation",
    "Stage 4: Reference list on request only",
  ],
  promptBlock: {
    title: "General Assignment Prompt",
    subtitle: "Reusable prompt block. Paste your brief and marking criteria - works for any assignment type.",
    content: `General Assignment Workflow - Brief to Completion

I am going to share my assignment brief and marking criteria with you. Your job is to read everything carefully, build a proper outline based on the brief requirements, then write the assignment section by section - one section at a time. Do not write everything at once.

My assignment brief and marking criteria:
[PASTE YOUR FULL BRIEF AND MARKING CRITERIA HERE]

Follow this exact process:

STAGE 1 - ANALYSE THE BRIEF
Read the full brief and identify:
- Assignment type (essay, report, case study, dissertation chapter, reflection, etc.)
- Word count and how it should be distributed across sections
- Subject and academic level
- Referencing style required
- Key requirements from the marking criteria - what gets the most marks and why
- Any specific instructions, restrictions, or formatting rules

Present a brief summary of your understanding before moving to the outline. Ask me to confirm before continuing.

STAGE 2 - BUILD THE OUTLINE
Based on the brief and marking criteria, create a section-by-section outline:
- List every section with its heading
- Write one sentence describing what each section will argue or cover
- Show the approximate word count for each section
- Confirm which sections carry the most marks

Do not start writing yet. Show me the outline and wait for my approval.

STAGE 3 - WRITE SECTION BY SECTION
After I approve the outline, write one section at a time.
- Start with Section 1 only
- End each section by asking: Section complete. Ready to move to [next section name]?
- Wait for my confirmation before writing the next section
- Follow the approved outline - do not change structure without asking
- Match the academic tone and referencing style required
- Hit the word count for each section

STAGE 4 - REVIEW EACH SECTION
After writing each section:
- State the word count of that section
- Confirm it addresses the marking criteria for that section
- Flag anything that may need more detail or a source

RULES:
- Never write more than one section at a time without my confirmation
- Always follow the brief requirements exactly
- Use academic language throughout
- Include in-text citations in the required referencing style
- Do not add a reference list until I ask for it at the end`,
  },
}

const specificAssignmentWorkflowSteps = {
  purpose:
    "Use this workflow when you know the assignment type. The AI applies the correct academic structure for that type (essay, report, case study, reflection, etc.), aligns it to the marking criteria, gets your outline approval, then writes one section at a time.",
  whenToUse: [
    "When you know the assignment type and want the AI to apply the correct structure automatically.",
    "When the marking criteria specifies a particular structure, framework, or model.",
    "When you want section-by-section writing with approval at each stage.",
    "Use for: Essay, Report, Case Study, Literature Review, Reflective Writing, Dissertation Chapter, Presentation Plan, Lab Report, Business Plan.",
  ],
  steps: [
    {
      number: 1,
      title: "Identify Type and Apply Correct Structure",
      details:
        "AI reads the assignment type and applies the standard academic structure for that type. Essay gets introduction, arguments, counter-argument, conclusion. Report gets executive summary through appendices. Case study gets background, problem identification, framework analysis, recommendations. Reflective writing uses Gibbs or Kolb model. Dissertation chapters follow the brief structure exactly.",
    },
    {
      number: 2,
      title: "Analyse Brief Against the Structure",
      details:
        "AI reads the marking criteria against the structure. Identifies which sections carry most marks, what frameworks or theories are required, word count distribution, and referencing style. Presents understanding and waits for confirmation.",
    },
    {
      number: 3,
      title: "Build the Section-by-Section Outline",
      details:
        "AI creates a detailed outline: every section heading, one sentence per section, approximate word count, and key frameworks or theories per section. Waits for approval before writing.",
    },
    {
      number: 4,
      title: "Write One Section at a Time",
      details:
        "After outline approval, AI writes one section only. After each section it states the word count, confirms it meets the marking criteria, flags anything needing more evidence, and asks for confirmation before the next section.",
    },
    {
      number: 5,
      title: "Complete and Reference",
      details:
        "After all sections are done, AI asks if you want the full reference list. Nothing added without your instruction.",
    },
  ],
  mandatoryOutputFormat: [
    "Stage 1: Assignment Type and Structure Applied",
    "Stage 2: Brief Analysis Against Marking Criteria",
    "Stage 3: Section-by-Section Outline with word counts",
    "Stage 4: One section at a time with word count and criteria confirmation",
    "Stage 5: Reference list on request only",
  ],
  promptBlock: {
    title: "Specific Assignment Prompt",
    subtitle: "Reusable prompt block. Tell AI your assignment type, paste your brief - it applies the right structure and writes section by section.",
    content: `Specific Assignment Workflow - Type-Based Brief to Completion

I am going to share my assignment type, brief, and marking criteria. Your job is to first identify the assignment type, apply the correct structure for that type, build a detailed outline, then write it section by section - one section at a time. Do not write everything at once.

My assignment type is:
[WRITE TYPE HERE - e.g. Essay, Report, Case Study, Literature Review, Reflective Writing, Dissertation Chapter, Presentation Plan, Lab Report, Business Plan]

My assignment brief and marking criteria:
[PASTE YOUR FULL BRIEF AND MARKING CRITERIA HERE]

Follow this exact process:

STAGE 1 - IDENTIFY TYPE AND APPLY CORRECT STRUCTURE
Based on the assignment type, apply the standard academic structure for that type.

If Essay: Introduction -> Main Arguments (2-4 body paragraphs) -> Counter-argument -> Conclusion
If Report: Executive Summary -> Introduction -> Findings -> Analysis -> Recommendations -> Conclusion -> References
If Case Study: Introduction -> Background -> Problem Identification -> Analysis (frameworks) -> Recommendations -> Conclusion
If Literature Review: Introduction -> Thematic Sections -> Gaps in Literature -> Conclusion
If Reflective Writing: Description -> Feelings -> Evaluation -> Analysis -> Conclusion -> Action Plan (Gibbs or Kolb)
If Dissertation Chapter: Follow the exact chapter structure from the brief
If Presentation Plan: Slide-by-slide plan with title, key points, speaker notes, visual suggestion
If Lab Report: Abstract -> Introduction -> Method -> Results -> Discussion -> Conclusion -> References
If Business Plan: Executive Summary -> Market Analysis -> Products/Services -> Marketing Strategy -> Financial Plan -> Conclusion
For any other type: apply the most appropriate academic structure based on the brief.

STAGE 2 - ANALYSE THE BRIEF AGAINST THE STRUCTURE
Read the marking criteria and confirm which sections carry the most marks, what the examiner is specifically looking for, word count distribution, referencing style, and any required frameworks or models. Present your understanding and wait for my confirmation.

STAGE 3 - BUILD THE SECTION-BY-SECTION OUTLINE
Create a detailed outline with every section heading, one sentence per section, approximate word count, and key frameworks or theories per section. Wait for my approval before writing.

STAGE 4 - WRITE ONE SECTION AT A TIME
Write Section 1 only. End with: Section complete. Ready to move to [next section name]? Wait for confirmation before the next section. Follow the approved outline. Use academic language and the required referencing style.

STAGE 5 - AFTER EACH SECTION
State the word count. Confirm it meets the marking criteria. Flag if any additional source or detail is needed.

RULES:
- Never write more than one section at a time without my confirmation
- Always apply the correct structure for the assignment type
- Follow the brief and marking criteria exactly
- Use in-text citations in the required referencing style throughout
- Do not produce the reference list until I ask for it at the end`,
  },
}

const assignmentIntelligenceWorkflowSteps = {
  purpose:
    "Use this workflow to extract every important detail from an assignment brief, confirm or suggest the topic, build a word count plan and perfect outline, then wait for approval before writing anything.",
  whenToUse: [
    "When you have an assignment brief and marking criteria but need the requirements extracted clearly first.",
    "When the topic may be unclear, open, missing, or needs academic refinement.",
    "When you need a word count distribution and outline before drafting begins.",
    "When you want the AI to stop before writing until you approve the outline.",
  ],
  steps: [
    {
      number: 1,
      title: "Full Brief Extraction",
      details:
        "AI reads the full brief and extracts assignment type, subject/module, academic level, word count, referencing style, submission format, deadline, marking criteria, specific instructions, what is present, and what is missing.",
    },
    {
      number: 2,
      title: "Topic Identification or Suggestion",
      details:
        "If the topic is given, AI states it and refines the academic title if needed. If the topic is open, AI suggests three topic options with title, marking-criteria fit, feasibility, and a strongest recommendation.",
    },
    {
      number: 3,
      title: "Word Count Distribution Plan",
      details:
        "After topic confirmation, AI creates a section-by-section word count table that matches the required total and highlights which sections carry the most marks.",
    },
    {
      number: 4,
      title: "Perfect Outline",
      details:
        "AI builds a complete outline with headings, 2 to 4 bullet points per section, required frameworks or source types, and the correct academic structure for the assignment type.",
    },
    {
      number: 5,
      title: "Approval Before Writing",
      details:
        "AI asks whether the outline is correct and waits for approval before writing a single word of the assignment.",
    },
  ],
  mandatoryOutputFormat: [
    "Stage 1: Full Brief Extraction numbered list",
    "Stage 2: Topic confirmation or three topic options",
    "Stage 3: Word count distribution table",
    "Stage 4: Perfect section-by-section outline",
    "Stage 5: Approval required before writing",
  ],
  promptBlock: {
    title: "Assignment Intelligence Prompt",
    subtitle: "Reusable prompt block. Paste the full brief and marking criteria to extract requirements, confirm the topic, and build the outline first.",
    content: `Assignment Intelligence Prompt

I am going to paste my assignment brief below. Your job is to read it completely, extract every important detail from it, suggest or confirm the topic, build a perfect outline, and then wait for my approval before writing anything.

My assignment brief:
[PASTE YOUR FULL ASSIGNMENT BRIEF AND MARKING CRITERIA HERE]

---

STAGE 1 - FULL BRIEF EXTRACTION
Read the entire brief carefully and extract the following. Present everything in a clean numbered list:

1. Assignment Type
   What kind of assignment is this? (Essay, Report, Case Study, Literature Review, Reflective Writing, Dissertation, Presentation, Lab Report, Business Plan, or other)

2. Subject and Module
   What is the subject, course, or module name?

3. Academic Level
   What level is this? (Undergraduate Year 1/2/3, Postgraduate, Masters, PhD, or not specified)

4. Total Word Count
   What is the total word count required?

5. Referencing Style
   What referencing style is required? (Harvard, APA, Chicago, Vancouver, or not specified)

6. Submission Format
   What format is required? (Word document, PDF, slides, report, portfolio, or not specified)

7. Deadline or Submission Date
   Is a deadline mentioned? If yes, state it. If not, write "Not specified."

8. Key Requirements from the Marking Criteria
   List every criterion being marked and its weighting or importance if stated.

9. Specific Instructions
   List any specific rules, restrictions, models, frameworks, or theories the brief requires.

10. What Is Present in the Brief
    List everything that is clearly given - topic, data, case, scenario, question, or any content already provided.

11. What Is Missing from the Brief
    List anything important that is NOT stated - topic, dataset, specific question, framework, or any detail that is unclear or absent.

---

STAGE 2 - TOPIC IDENTIFICATION OR SUGGESTION
Based on what you extracted:

If the topic is clearly given in the brief:
- State the exact topic
- Confirm the essay question or research question if present
- Suggest a refined academic title if the brief does not provide one

If the topic is open or not given:
- Suggest 3 strong topic options relevant to the subject and assignment type
- For each topic suggestion provide:
  a. Topic name
  b. Suggested academic title (10 to 15 words)
  c. One sentence explaining why this topic scores well against the marking criteria
  d. Feasibility note - are sources easily available for this topic?
- After listing all 3 options, recommend the strongest one with a clear reason

End Stage 2 by asking: "Which topic would you like to proceed with? Please confirm or choose an option."

Wait for my confirmation before continuing.

---

STAGE 3 - WORD COUNT DISTRIBUTION PLAN
After topic is confirmed, create a word count plan:
- List every section of the assignment
- Assign an approximate word count to each section
- Total must match the required word count
- Show which sections carry the most marks and deserve more words
- Present as a table: Section | Word Count | Marks Focus

---

STAGE 4 - PERFECT OUTLINE
Build a complete section-by-section outline:
- Every section heading
- Under each heading: 2 to 4 bullet points describing exactly what that section will cover
- Any specific framework, model, theory, or source type required in that section
- Based on what was given in the brief - do not invent requirements not in the brief
- If the brief does not specify structure, apply the standard academic structure for the assignment type

Present the full outline and ask: "Does this outline look correct? Should I adjust anything before I start writing?"

Wait for my approval before writing a single word of the assignment.

---

RULES:
- Do not start writing the assignment until I have approved the outline
- Do not assume a topic without offering options if the topic is open
- Do not skip the extraction stage - it must always come first
- Always base the outline on what the brief actually requires
- If anything in the brief is unclear, flag it in Stage 1 under "What Is Missing"
- Never produce a reference list unless I ask for it`,
  },
}

const assignmentIntelligenceSteps = {
  purpose:
    "Use this workflow before starting any assignment. Paste the brief and the AI will extract all details, flag what is missing, suggest or confirm the topic, distribute the word count, and build a complete outline - all before writing a single word.",
  whenToUse: [
    "When you have just received an assignment brief and do not know where to start.",
    "When the topic is open and you need strong topic options with academic titles.",
    "When you want to know exactly what the brief requires before writing.",
    "When you want a perfect section-by-section outline approved before the AI starts writing.",
    "Works for any assignment type at any academic level.",
  ],
  steps: [
    {
      number: 1,
      title: "Full Brief Extraction",
      details:
        "AI reads the entire brief and extracts: assignment type, subject, academic level, word count, referencing style, submission format, deadline, marking criteria and weightings, specific instructions, what is present in the brief, and what is missing or unclear.",
    },
    {
      number: 2,
      title: "Topic Identification or Suggestion",
      details:
        "If the topic is given, AI confirms it and suggests a refined academic title. If the topic is open, AI suggests 3 strong topic options - each with a topic name, academic title, reason it scores well against the criteria, and a feasibility note on source availability. AI recommends the strongest option and waits for confirmation.",
    },
    {
      number: 3,
      title: "Word Count Distribution Plan",
      details:
        "After topic is confirmed, AI creates a table showing every section, its approximate word count, and its marks focus. Total must match the required word count. Sections worth more marks receive more words.",
    },
    {
      number: 4,
      title: "Perfect Outline",
      details:
        "AI builds a complete section-by-section outline based strictly on what the brief requires. Every section has a heading and 2 to 4 bullet points describing exactly what it will cover. AI waits for outline approval before writing a single word.",
    },
  ],
  mandatoryOutputFormat: [
    "Stage 1: Full Brief Extraction (11 points)",
    "Stage 2: Topic confirmation or 3 topic options with academic titles",
    "Stage 3: Word Count Distribution Table (Section | Word Count | Marks Focus)",
    "Stage 4: Complete Section-by-Section Outline",
    "Writing begins only after outline approval",
  ],
  promptBlock: {
    title: "Assignment Intelligence Prompt",
    subtitle:
      "Reusable prompt block. Paste any brief - AI extracts everything, suggests the topic, plans word count, and builds the outline.",
    content: `Assignment Intelligence Prompt

I am going to paste my assignment brief below. Your job is to read it completely, extract every important detail from it, suggest or confirm the topic, build a perfect outline, and then wait for my approval before writing anything.

My assignment brief:
[PASTE YOUR FULL ASSIGNMENT BRIEF AND MARKING CRITERIA HERE]

STAGE 1 - FULL BRIEF EXTRACTION
Read the entire brief and extract:
1. Assignment Type
2. Subject and Module
3. Academic Level
4. Total Word Count
5. Referencing Style
6. Submission Format
7. Deadline or Submission Date
8. Key Requirements from the Marking Criteria (with weightings if stated)
9. Specific Instructions (models, frameworks, theories required)
10. What Is Present in the Brief (topic, data, case, scenario, question)
11. What Is Missing from the Brief (anything unclear or not stated)

STAGE 2 - TOPIC IDENTIFICATION OR SUGGESTION
If topic is given: confirm it and suggest a refined academic title.
If topic is open: suggest 3 strong topic options each with:
a. Topic name
b. Suggested academic title (10 to 15 words)
c. Why it scores well against the marking criteria
d. Feasibility note on source availability
Recommend the strongest option. Wait for my confirmation before continuing.

STAGE 3 - WORD COUNT DISTRIBUTION PLAN
After topic confirmed, create a table:
Section | Word Count | Marks Focus
Total must match the required word count.

STAGE 4 - PERFECT OUTLINE
Build a complete section-by-section outline:
- Every section heading
- 2 to 4 bullet points per section describing exactly what it will cover
- Any framework, model, or theory required in that section
- Based strictly on the brief - do not invent requirements
Wait for my approval before writing anything.

RULES:
- Do not start writing until outline is approved
- Do not assume a topic if it is open - always offer options
- Always extract the brief fully in Stage 1 first
- Flag anything missing or unclear in Stage 1 Point 11
- Never produce a reference list unless I ask for it`,
  },
}

export const workflowSteps = Object.assign([
  {
    number: 1,
    title: "Read Assignment Criteria",
    explanation:
      "Carefully read the assignment brief, rubric, learning outcomes, formatting requirements, word count, citation style, and submission instructions before writing.",
    prompt:
      "Read the full assignment brief carefully. Identify the marking criteria, learning outcomes, required structure, word count, citation style, formatting rules, and submission requirements. Do not begin writing until all requirements are fully understood.",
  },
  {
    number: 2,
    title: "Identify Subject and Assignment Title",
    explanation:
      "Extract the subject name and assignment title so the academic role and writing approach can be tailored correctly.",
    prompt:
      "Identify the subject area and assignment title from the provided brief. Replace [SUBJECT] with the actual subject, such as Cybersecurity, Marketing, Civil Engineering, Business Management, or Computer Science. Replace [ASSIGNMENT_TITLE] with the exact assignment title.",
  },
  {
    number: 3,
    title: "Expert Academic Role Prompt",
    explanation:
      "Use this prompt to make the assistant behave like a professor-level expert in the selected academic subject.",
    prompt:
      "Act as a professor-level expert in [SUBJECT] with 15+ years of academic, research, and professional experience. Prepare work on [ASSIGNMENT_TITLE] at [ACADEMIC_LEVEL] level using formal academic reasoning, critical analysis, subject-specific terminology, and evidence-based argumentation. Maintain a professional academic tone throughout.",
  },
  {
    number: 4,
    title: "Step-by-Step Assignment Execution",
    explanation:
      "Ensure the work is completed systematically without irrelevant discussion, filler, repetition, or unsupported claims.",
    prompt:
      "Complete this assignment step by step. First analyze the criteria, then create an outline, then develop each section logically. Avoid irrelevant discussion, filler, repetition, unsupported claims, and informal language. Every section must directly support the assignment requirements.",
  },
  {
    number: 5,
    title: "Assignment Outline Generator",
    explanation: "Generate a strong academic structure before drafting the full assignment.",
    prompt:
      "Create a detailed academic outline for [ASSIGNMENT_TITLE] in the subject area of [SUBJECT]. The outline must match the assignment criteria, [WORD_COUNT] word count, [ACADEMIC_LEVEL] level, and [CITATION_STYLE] referencing style. Include an introduction, main body sections, critical analysis points, conclusion, and reference requirements.",
  },
  {
    number: 6,
    title: "Citation and Reference Verification",
    explanation:
      "Check citation consistency, source credibility, and reference-list accuracy before finalizing the assignment.",
    prompt:
      "Check all in-text citations and references carefully. Ensure every in-text citation appears in the reference list, every reference list entry is cited in the text, the required [CITATION_STYLE] style is followed, and no fabricated sources are included. Use only credible, relevant, and academically appropriate sources.",
  },
  {
    number: 7,
    title: "Academic Quality Review",
    explanation:
      "Review the assignment for academic quality, originality, clarity, structure, grammar, and rubric alignment.",
    prompt:
      "Review the assignment for academic quality, originality, coherence, logical flow, grammar, formatting, rubric alignment, citation accuracy, and word count compliance. Improve clarity and academic tone while preserving the meaning and ensuring the work remains ethically prepared and properly referenced.",
  },
  {
    number: 8,
    title: "Final Word Document Preparation",
    explanation:
      "Prepare the final assignment in a clean academic structure suitable for Microsoft Word submission.",
    prompt:
      "Organize the final assignment into a Word-document-ready academic format. Include the title, introduction, main body sections, critical analysis, conclusion, and reference list where required. Ensure the final version is polished, formal, properly referenced, and suitable for academic submission.",
  },
], {
  "essay-topic-selection": essayTopicSelectionSteps,
  "dissertation-topic-selection": dissertationTopicSelectionSteps,
  "general-assignment-workflow": generalAssignmentWorkflowSteps,
  "specific-assignment-workflow": specificAssignmentWorkflowSteps,
  "assignment-intelligence-workflow": assignmentIntelligenceWorkflowSteps,
  "assignment-intelligence": assignmentIntelligenceSteps,
})

export const masterPrompt = `You are a professor-level academic expert in [SUBJECT] with 15+ years of academic, research, and professional experience.

Your task is to help prepare an academic assignment titled [ASSIGNMENT_TITLE] at [ACADEMIC_LEVEL] level.

Before writing, carefully read and analyze the assignment brief, rubric, learning outcomes, formatting requirements, word count, citation style, and submission instructions.

Follow this workflow:
1. Identify the assignment criteria.
2. Identify the subject, topic, and academic level.
3. Create a detailed academic outline.
4. Develop the assignment section by section.
5. Use formal academic reasoning and subject-specific terminology.
6. Support claims with credible academic evidence.
7. Use [CITATION_STYLE] referencing correctly.
8. Check that every in-text citation appears in the reference list.
9. Check that every reference list entry is cited in the text.
10. Avoid fabricated sources, unsupported claims, irrelevant discussion, filler, and informal language.
11. Review the final work for academic tone, originality, logical flow, grammar, formatting, rubric alignment, and word count compliance.
12. Prepare the final response in a Word-document-ready academic format.

The final assignment must be clear, structured, evidence-based, properly referenced, academically rigorous, and suitable for submission.`

export const generalAssignmentWorkflowPrompt = generalAssignmentWorkflowSteps.promptBlock.content

export const specificAssignmentWorkflowPrompt = specificAssignmentWorkflowSteps.promptBlock.content

export const assignmentIntelligenceWorkflowPrompt = assignmentIntelligenceWorkflowSteps.promptBlock.content

export const workflowCards = [
  {
    title: "Unknown Assignment Workflow",
    slug: "unknown-assignment-workflow",
    category: "Planning First",
    subtitle: "For unclear, unfamiliar, incomplete, or first-time assignments.",
    description:
      "Analyze the subject, brief, required tools, task breakdown, structure, deliverables, and next action plan before starting.",
    buttonText: "View Workflow",
  },
  {
    title: "Tools Installation Workflow",
    slug: "tools-installation-workflow",
    category: "Tool Setup First",
    subtitle: "For software, notebooks, technical platforms, and setup-based assignments.",
    description:
      "Use when an assignment requires installing, selecting, configuring, or using technical tools.",
    buttonText: "View Workflow",
  },
  {
    title: "Essay Topic Selection Workflow",
    slug: "essay-topic-selection",
    category: "Academic Planning",
    badge: "Planning First",
    icon: "GraduationCap",
    promptCount: 9,
    subtitle: "For selecting a strong, high-marks essay topic before writing begins.",
    description:
      "For selecting a strong, high-marks essay topic based on the assessment brief and marking criteria.",
    buttonText: "View Workflow",
  },
  {
    title: "Dissertation Topic Selection Workflow",
    slug: "dissertation-topic-selection",
    category: "Academic Planning",
    badge: "Planning First",
    icon: "GraduationCap",
    promptCount: 11,
    subtitle: "For selecting a viable, well-scoped dissertation topic before research begins.",
    description:
      "For selecting a viable, well-scoped dissertation topic aligned to assessment criteria and research feasibility.",
    buttonText: "View Workflow",
  },
  {
    title: "Assignment Intelligence",
    slug: "assignment-intelligence",
    category: "Academic Planning",
    badge: "Planning First",
    icon: "GraduationCap",
    promptCount: 4,
    subtitle: "Extract every brief detail and build a perfect outline before writing.",
    description:
      "Paste any assignment brief - AI extracts every detail, identifies what is present and what is missing, suggests or confirms the topic with academic title and word count plan, then builds a perfect outline before writing begins.",
    buttonText: "View Workflow",
  },
  {
    title: "Assignment Intelligence Prompt",
    slug: "assignment-intelligence-workflow",
    category: "Academic Planning",
    badge: "Brief Analysis",
    icon: "GraduationCap",
    promptCount: 5,
    subtitle: "Extract the brief, confirm the topic, plan word count, and build the outline before writing.",
    description:
      "Reads the full assignment brief and marking criteria, identifies missing details, suggests or confirms the topic, builds a word count plan, and waits for outline approval.",
    buttonText: "View Workflow",
  },
  {
    title: "Specific Assignment Workflow",
    slug: "specific-assignment-workflow",
    category: "Academic Writing",
    badge: "Academic Writing",
    icon: "GraduationCap",
    promptCount: 5,
    subtitle: "For a known assignment type with the correct structure applied first.",
    description:
      "For a known assignment type - essay, report, case study, reflection, literature review, dissertation chapter, and more. AI applies the correct structure for the type, builds the outline, then writes section by section.",
    buttonText: "View Workflow",
  },
  {
    title: "General Assignment Workflow",
    slug: "general-assignment-workflow",
    category: "Academic Writing",
    badge: "Academic Writing",
    icon: "GraduationCap",
    promptCount: 4,
    subtitle: "For any assignment type, from brief analysis to section-by-section completion.",
    description:
      "For any assignment type. Paste your brief and marking criteria - AI analyses it, builds the outline, then writes section by section with your approval at each stage.",
    buttonText: "View Workflow",
  },
  {
    title: "General Assignment Workflow",
    slug: "standard-academic-assignment-workflow",
    category: "Academic Writing",
    subtitle: "Brief to completion, written one approved section at a time.",
    description:
      "Analyze the brief, build an approved outline, then write and review each assignment section step by step.",
    buttonText: "View Workflow",
  },
  {
    title: "Master Assignment Prompt",
    slug: "master-assignment-prompt",
    category: "Master Prompt",
    subtitle: "Complete workflow in one reusable prompt.",
    description:
      "Use the complete assignment workflow in one instruction, from role setup to final review.",
    buttonText: "View Prompt",
  },
]

export function getWorkflowCard(slug: string) {
  return workflowCards.find(workflow => workflow.slug === slug)
}
