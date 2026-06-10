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

const essayTopicSelectionSteps = [
  {
    number: 1,
    title: "Read the Assessment Brief",
    explanation:
      "Purpose: Understand the full scope before anything else. Details: Identify module name, word count, submission format, referencing style, and whether the topic is fixed or open.",
    prompt:
      "Read the full essay assessment brief. Identify the module name, word count, submission format, referencing style, and whether the essay topic is fixed or open. Do not suggest topics until the brief is fully understood.",
  },
  {
    number: 2,
    title: "Extract the Marking Criteria",
    explanation:
      "Purpose: Know exactly what is being marked and at what weighting. Details: Note the weighting percentage for each criterion: critical analysis, argument structure, referencing, research depth, originality, presentation.",
    prompt:
      "Extract the marking criteria from the essay brief. Note each criterion and weighting percentage, including critical analysis, argument structure, referencing, research depth, originality, and presentation.",
  },
  {
    number: 3,
    title: "Identify Topic Freedom Level",
    explanation:
      "Purpose: Decide whether topic selection is needed. Details: If the topic is fixed by the brief, skip to Step 5. If the topic is open, continue to Step 4.",
    prompt:
      "Decide whether the essay topic is fixed or open. If the topic is fixed, explain that topic selection is not needed and move to evaluating scope. If the topic is open, prepare to generate topic options.",
  },
  {
    number: 4,
    title: "Generate 3 to 5 Topic Options",
    explanation:
      "Purpose: Create a shortlist of viable essay topics. Details: Each topic must be specific, researchable, and aligned to the module learning outcomes.",
    prompt:
      "Generate 3 to 5 essay topic options. Each option must be specific rather than broad, researchable through academic sources, and aligned with the module learning outcomes.",
  },
  {
    number: 5,
    title: "Evaluate Each Topic Against Marking Criteria",
    explanation:
      "Purpose: Score each topic option objectively. Details: Ask whether each topic can score high on critical analysis, argument structure, source availability, and word-count scope.",
    prompt:
      "Evaluate each essay topic against the marking criteria. For each topic, assess critical analysis potential, argument structure, academic source availability, and whether the topic fits within the word count.",
  },
  {
    number: 6,
    title: "Select the Strongest Topic",
    explanation:
      "Purpose: Commit to one topic with clear justification. Details: Choose the topic with the highest alignment to the marking criteria weightings and the best source availability.",
    prompt:
      "Select the strongest essay topic. Justify the choice using marking criteria alignment, source availability, scope control, originality, and expected high-mark potential.",
  },
  {
    number: 7,
    title: "Write a Focused Essay Question",
    explanation:
      "Purpose: Turn the topic into a precise academic question. Details: Use academic stems such as To what extent, Critically analyse, Evaluate the impact of, or Discuss the relationship between.",
    prompt:
      "Turn the selected essay topic into a focused academic question. Use an academic stem such as To what extent, Critically analyse, Evaluate the impact of, or Discuss the relationship between.",
  },
  {
    number: 8,
    title: "Confirm Scope and Angle",
    explanation:
      "Purpose: Define the exact boundaries of the essay before writing begins. Details: State what the essay will cover, what it will exclude, the main argument or position, and the referencing style required.",
    prompt:
      "Confirm the essay scope and angle. State what the essay will cover, what it will exclude, the main argument or position, and the required referencing style.",
  },
  {
    number: 9,
    title: "Identify Key Starting Sources",
    explanation:
      "Purpose: Ensure research is possible before committing to the topic. Details: Find 3 to 5 academic sources directly relevant to the selected topic and essay question.",
    prompt:
      "Identify 3 to 5 key starting sources for the selected essay topic. Prioritize peer-reviewed journal articles, academic books, and credible reports directly relevant to the essay question.",
  },
]

const dissertationTopicSelectionSteps = [
  {
    number: 1,
    title: "Read the Dissertation Brief",
    explanation:
      "Purpose: Understand the full project scope before anything else. Details: Identify degree subject, word count, required chapter structure, research type, submission deadline, and supervisor requirements.",
    prompt:
      "Read the full dissertation brief. Identify the degree subject, word count, required chapter structure, research type, submission deadline, and any supervisor requirements before suggesting topics.",
  },
  {
    number: 2,
    title: "Extract Marking Criteria and Weightings",
    explanation:
      "Purpose: Know exactly what the examiner is looking for. Details: Note the weighting for literature review, methodology, critical analysis, originality, argument, presentation, and referencing.",
    prompt:
      "Extract the dissertation marking criteria and weightings. Note how literature review, methodology, critical analysis, originality, argument, presentation, and referencing are assessed.",
  },
  {
    number: 3,
    title: "Identify Required Research Type",
    explanation:
      "Purpose: Understand what kind of research the brief expects. Details: Primary research requires ethics approval and participants, secondary research is faster and lower risk, and mixed methods combines both.",
    prompt:
      "Identify whether the dissertation requires primary research, secondary research, or mixed methods. Explain the practical implications of that research type.",
  },
  {
    number: 4,
    title: "Run a Feasibility Check on Research Type",
    explanation:
      "Purpose: Avoid choosing a path that cannot be completed in time. Details: Flag risks around ethics approval, participant access, literature availability, and timeline realism.",
    prompt:
      "Run a feasibility check on the required research type. Flag risks involving ethics approval, participant access, source availability, data access, and the available timeline.",
  },
  {
    number: 5,
    title: "Generate 3 to 5 Dissertation Topic Options",
    explanation:
      "Purpose: Build a shortlist of viable topics. Details: Each topic must be specific, researchable, original enough to contribute to the field, and relevant to the degree subject.",
    prompt:
      "Generate 3 to 5 dissertation topic options. Each topic must be specific, researchable, original enough for the field, and clearly relevant to the degree subject.",
  },
  {
    number: 6,
    title: "Evaluate Each Topic for Feasibility",
    explanation:
      "Purpose: Score each topic before committing. Details: Assess source availability, method practicality, word-count scope, and risk of overlap with common submissions.",
    prompt:
      "Evaluate each dissertation topic for feasibility. Assess academic source availability, practical research method, manageable scope within the word count, originality, and risk of overlap with common submissions.",
  },
  {
    number: 7,
    title: "Select the Strongest Topic",
    explanation:
      "Purpose: Commit to one topic with full justification. Details: Choose the topic with the highest combination of feasibility score and marking criteria alignment.",
    prompt:
      "Select the strongest dissertation topic. Justify it using feasibility, marking criteria alignment, originality, method practicality, source availability, and scope control.",
  },
  {
    number: 8,
    title: "Write the Dissertation Title and Research Questions",
    explanation:
      "Purpose: Lock in the academic framing of the research. Details: Title should be 10 to 15 words, specific, and academic. Write one main question and 2 to 3 sub-questions.",
    prompt:
      "Write a formal dissertation title of 10 to 15 words. Then write one main research question and 2 to 3 sub-questions that together cover the full research scope.",
  },
  {
    number: 9,
    title: "Produce the Chapter Outline",
    explanation:
      "Purpose: Plan the full dissertation structure before writing begins. Details: Write one sentence describing each chapter: Introduction, Literature Review, Methodology, Findings, Discussion, Conclusion.",
    prompt:
      "Produce a dissertation chapter outline. Write one sentence describing the purpose of each chapter: Introduction, Literature Review, Methodology, Findings, Discussion, and Conclusion.",
  },
  {
    number: 10,
    title: "Confirm Research Methodology",
    explanation:
      "Purpose: Justify the approach before data collection or literature review begins. Details: Decide between qualitative, quantitative, or mixed methods and primary or secondary research.",
    prompt:
      "Confirm the dissertation methodology. Decide whether the study should be qualitative, quantitative, or mixed methods, and whether it should use primary or secondary research. Justify the choice.",
  },
  {
    number: 11,
    title: "Identify Key Starting Sources",
    explanation:
      "Purpose: Confirm the topic is researchable before fully committing. Details: Find 5 to 8 peer-reviewed academic sources directly relevant to the selected topic and research questions.",
    prompt:
      "Identify 5 to 8 key starting sources for the dissertation topic. Prioritize peer-reviewed journal articles, academic books, and high-quality reports directly relevant to the research questions.",
  },
]

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
    title: "Standard Academic Assignment Workflow",
    slug: "standard-academic-assignment-workflow",
    category: "Academic Writing",
    subtitle: "For normal academic assignments, essays, reports, and structured submissions.",
    description:
      "Prepare academic work from criteria reading to final Word-document-ready submission.",
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
