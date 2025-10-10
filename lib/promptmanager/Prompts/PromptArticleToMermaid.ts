import type { PromptData } from '../types';

export const PromptArticleToJSON: PromptData = {
  id: 'article-to-json',
  name: 'Article to Multiple Flowcharts Converter',
  description: 'Converts article directly to multiple Mermaid flowchart diagrams',
  prompt: `Analyze the following article and create SEPARATE flowchart diagrams for each major topic/concept.

IMPORTANT INSTRUCTIONS:
1. Identify ALL topics that would benefit from visual representation as flowcharts
2. Create a SEPARATE flowchart for EACH topic (not subgraphs in one diagram)
3. Each flowchart should be clear, focused, and easy to read
4. Keep diagrams COMPACT - aim for 6-12 nodes per diagram maximum
5. Balance width and height - avoid extremely tall or wide diagrams
6. If a topic needs more nodes, split it into multiple related diagrams

Article:
{{content}}

Return multiple Mermaid diagrams in this EXACT format:

---DIAGRAM: Topic 1 Title---
flowchart TD
    A[Start] --> B[End]

---DIAGRAM: Topic 2 Title---
flowchart LR
    X[Begin] --> Y[Finish]

---DIAGRAM: Topic 3 Title---
flowchart TD
    P[Another] --> Q[Diagram]

CRITICAL FORMATTING RULES:
- Each diagram MUST start with: ---DIAGRAM: [Title]---
- Put the Mermaid code directly after the delimiter line
- Separate diagrams with a blank line
- DO NOT use markdown code blocks (no triple backticks)
- DO NOT add explanatory text
- Return ONLY the diagrams with delimiters
- Each topic gets its own independent flowchart

MERMAID SYNTAX RULES - TEXT-ONLY (MUST FOLLOW STRICTLY):
1. Node Text Rules - SIMPLE TEXT ONLY:
   - Use ONLY: letters, numbers, spaces, basic punctuation (. - ! ?)
   - NO special characters: @ # $ % & * ( ) [ ] { } < > quotes symbols
   - NO quotes in text (single or double)
   - NO parentheses, brackets, or symbols in text
   - ONLY exception: <br/> for line breaks
   
   CORRECT Examples:
   - A[Start Process]
   - B[Analyze Data]
   - C[Step 1]
   - D[Check Results]
   - E[Process Complete]
   
   WRONG Examples:
   - A["Text with quotes"]  ❌ NO quotes
   - B[Text (with) parentheses]  ❌ NO parentheses
   - C[Text & symbols]  ❌ NO special symbols
   - D[Text: with colon]  ❌ NO colons
   - E[Text @#$%]  ❌ NO special characters

2. Node Declaration Format:
   - ALWAYS: NodeID[Simple text here]
   - Space before bracket: A [Text]
   - Space after bracket when continuing: A[Text] --> B[More]
   
   CORRECT: A[Text here]
   WRONG: A[Text]Extra text
   WRONG: AThere should be space

3. Long Text in Nodes:
   - Keep text concise (max 50 characters)
   - Use <br/> ONLY for line breaks
   - NO other HTML tags allowed
   
   CORRECT: 
   - A[Long text here<br/>Second line]
   - B[First part<br/>Second part<br/>Third part]
   
   WRONG:
   - A[text with "quotes" <br/> more]  ❌ NO quotes
   - B[text: with colon<br/>text]  ❌ NO colons
   - C[text (parentheses)<br/>text]  ❌ NO parentheses
   - D[<b>Bold text</b>]  ❌ NO HTML tags except <br/>

4. Connection Syntax:
   - Solid arrow: A --> B
   - Labeled arrow: A -->|Label| B (text only, no special chars)
   - Dotted arrow: A -.-> B
   - Thick arrow: A ==> B
   - Simple line: A --- B
   
   CORRECT Examples:
   - A --> B
   - A -->|Yes| B
   - A -->|No| C
   - A -.->|Optional| B
   
   WRONG Examples:
   - A-->B  ❌ missing spaces
   - A --- "Label" --> B  ❌ mixed syntax
   - A -->|"Yes"| B  ❌ NO quotes in labels
   - A --> B[Text]C  ❌ no space after bracket
   - A ----> B  ❌ too many dashes
   
   CRITICAL: 
   - Never mix arrow types
   - Labels must be simple text only
   - NO quotes in labels: -->|Yes| not -->|"Yes"|

5. Node IDs:
   - Must be unique and alphanumeric
   - CORRECT: A, B, C, D, Node1, Step2
   - WRONG: Node-1, Node_1 (avoid hyphens/underscores)
   - Keep IDs simple: A, B, C is best

6. NO SPECIAL CHARACTERS:
   - Remove ALL special characters from text
   - Convert "50%" to "50 percent"
   - Convert "Example #1" to "Example 1"
   - Convert "Data & Results" to "Data and Results"
   - Convert "Process (optional)" to "Process optional"
   - Only simple text allowed in ALL nodes and labels

7. Diagram Size Management:
   - Maximum 12 nodes per diagram (6-10 is ideal)
   - Maximum depth: 5-6 levels for vertical flowcharts
   - Maximum width: 3-4 parallel branches for horizontal spread
   - Use subgraphs to fill unused spaces and change directions
   - Make subgraph backgrounds transparent (no colors)
   - Aim for balanced proportions: avoid tall thin or wide flat diagrams
   - If content exceeds limits, split into multiple diagrams
   

8. Flowchart Shape Best Practices:
   IMPORTANT: AVOID SHARP CORNERS - Use rounded shapes whenever possible!
   
   - Use ((Fully Rounded)) or ([Rounded]) for most nodes - PREFERRED
   - Use [Rectangle] only when necessary for process steps
   - Use {Diamond} for decision points and conditions
   - Use ((Circle)) for start/end points - BEST CHOICE
   - Use ([Rounded]) as alternative for start/end or general nodes
   - Use [[Subroutine]] for sub-processes or function calls
   - Use [(Database)] for data storage operations
   - Use [/Parallelogram/] for input/output operations
   
   CORRECT Shape Usage Examples with Rounded Corners:
   - Start((Start)) --> Process([Process Data])
   - Decision{Is Valid?} -->|Yes| Action([Continue])
   - Database[(Save to DB)] --> End((End))
   - Input[/Enter Data/] --> Validate([Validate Input])
   - Step1((Begin)) --> Step2((Process)) --> Step3((Finish))
   
   SHAPE PRIORITY (Best to use):
   1. ((Text)) - Fully rounded circle - BEST, use for most nodes
   2. ([Text]) - Rounded rectangle - Good alternative
   3. [Text] - Sharp rectangle - Use only when needed
   4. {Text} - Diamond - Only for decisions

CRITICAL: DIAGRAM INITIALIZATION REQUIRED
EVERY diagram MUST start with this exact init line:
%%{init: {'flowchart': {'nodeSpacing': 50, 'rankSpacing': 80, 'curve': 'basis'}}}%%

Then follow with the flowchart declaration (flowchart TD or flowchart LR)

EXAMPLES OF CORRECT DIAGRAMS WITH ROUNDED CORNERS:
%%{init: {'flowchart': {'nodeSpacing': 50, 'rankSpacing': 80, 'curve': 'basis'}}}%%
flowchart TD
    Start((Start Process)) --> B([Step One])
    B --> C{Is Valid?}
    C -->|Yes| D([Process Data])
    C -->|No| E([Show Error])
    D --> F((End))
    E --> F

%%{init: {'flowchart': {'nodeSpacing': 50, 'rankSpacing': 80, 'curve': 'basis'}}}%%
flowchart LR
    Start((Begin Analysis)) --> Process([Analyze Data])
    Process --> Decision{Check Results?}
    Decision -->|Pass| Success((Success))
    Decision -->|Fail| Retry([Retry Process])
    Retry --> Process
}`
};

