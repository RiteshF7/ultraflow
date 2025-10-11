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

═══════════════════════════════════════════════════════════════
CRITICAL: MERMAID CODE STRUCTURE (MUST FOLLOW THIS ORDER)
═══════════════════════════════════════════════════════════════
1. Init configuration (REQUIRED - see below)
2. Flowchart declaration with direction (flowchart TB/LR/RL/BT)
3. ALL NODE DECLARATIONS FIRST
4. ALL LINK DEFINITIONS AFTER NODES
5. SUBGRAPH DEFINITIONS (if needed)

CORRECT STRUCTURE:
%%{init: {'flowchart': {'nodeSpacing': 50, 'rankSpacing': 80, 'curve': 'basis'}}}%%
flowchart TD
    %% Declare all nodes first
    A[Node A]
    B[Node B]
    C{Decision}
    
    %% Then define all links
    A --> B
    B --> C

═══════════════════════════════════════════════════════════════
FLOWCHART DIRECTIONS
═══════════════════════════════════════════════════════════════
- TB or TD: Top to bottom (default, best for processes)
- LR: Left to right (good for timelines, workflows)
- RL: Right to left
- BT: Bottom to top

═══════════════════════════════════════════════════════════════
NODE SHAPES REFERENCE - USE ROUNDED SHAPES FIRST!
═══════════════════════════════════════════════════════════════

PRIORITY SHAPES (Use these most):
1. ((Text)) - Fully rounded circle - BEST for start/end/general nodes
2. ([Text]) - Rounded rectangle/stadium - Good for process steps
3. {Text} - Diamond - ONLY for decisions/conditions
4. [Text] - Rectangle - Use sparingly, prefer rounded shapes

BASIC SHAPES:
- Rectangle: A[Text]
- Rounded: A(Text)
- Stadium: A([Text]) ← PREFERRED for processes
- Circle: A((Text)) ← PREFERRED for start/end
- Rhombus/Decision: A{Text} ← For decisions only
- Hexagon: A{{Text}}
- Database: A[(Text)]

WHEN TO USE EACH SHAPE:
- Start/End points: ((Text)) or ([Text])
- Process steps: ([Text]) or (Text)
- Decisions: {Text}
- Data/Storage: [(Text)]
- Input/Output: [/Text/] or [\\Text\\]
- Subroutines: [[Text]]

═══════════════════════════════════════════════════════════════
TEXT RULES - SIMPLE TEXT ONLY (CRITICAL)
═══════════════════════════════════════════════════════════════

1. ALLOWED IN NODE TEXT:
   ✓ Letters (a-z, A-Z)
   ✓ Numbers (0-9)
   ✓ Spaces
   ✓ Basic punctuation: . - ! ?
   ✓ Line breaks: <br/> ONLY

2. NOT ALLOWED (Remove or convert):
   ✗ Quotes: " ' (single or double)
   ✗ Parentheses: ( )
   ✗ Brackets: [ ] { }
   ✗ Special chars: @ # $ % & * < > / \\ |
   ✗ Colons: :
   ✗ Semicolons: ;
   ✗ Any HTML tags except <br/>

3. TEXT CONVERSION RULES:
   - "50%" → "50 percent"
   - "Example #1" → "Example 1"
   - "Data & Results" → "Data and Results"
   - "Process (optional)" → "Process optional"
   - "Step: One" → "Step One"
   - "Name/Title" → "Name or Title"

CORRECT NODE EXAMPLES:
✓ A((Start Process))
✓ B([Step One])
✓ C{Is Valid?}
✓ D([Process Data])
✓ E((End))
✓ F([Long text here<br/>on two lines])

WRONG NODE EXAMPLES:
✗ A["Text with quotes"]
✗ B[Text (with) parentheses]
✗ C[Text & symbols]
✗ D[Text: with colon]
✗ E[Text @#$%]
✗ F[Text] Extra text without space

═══════════════════════════════════════════════════════════════
LINK TYPES & SYNTAX
═══════════════════════════════════════════════════════════════

BASIC LINKS (Always use spaces):
- Solid arrow: A --> B
- Open link: A --- B
- Dotted arrow: A -.-> B
- Thick arrow: A ==> B

LINKS WITH LABELS (Simple text only, NO quotes):
- A -->|Yes| B
- A -->|No| C
- A -.->|Optional| D
- A ==>|Confirm| E

SPECIAL ARROWS:
- Circle edge: A --o B
- Cross edge: A --x B
- Bidirectional: A <--> B

LINK CHAINING:
- Single chain: A --> B --> C
- Multiple targets: A --> B & C & D

CRITICAL LINK RULES:
✓ CORRECT: A --> B
✓ CORRECT: A -->|Yes| B
✓ CORRECT: A --> B --> C
✗ WRONG: A-->B (missing spaces)
✗ WRONG: A --- "Label" --> B (mixed syntax)
✗ WRONG: A -->|"Yes"| B (NO quotes in labels)
✗ WRONG: A --> B[Text]C (no space after bracket)

═══════════════════════════════════════════════════════════════
SUBGRAPHS (For organization and spacing)
═══════════════════════════════════════════════════════════════
subgraph ID["Display Title"]
    direction TB
    NodeA([Content])
    NodeB([Content])
    NodeA --> NodeB
end

- Use subgraphs to organize related nodes
- Can change direction within subgraph
- Keep subgraphs transparent (no background colors)
- Use to balance diagram layout
- Maximum 2-3 subgraphs per diagram

═══════════════════════════════════════════════════════════════
DIAGRAM SIZE MANAGEMENT
═══════════════════════════════════════════════════════════════
- Maximum: 12 nodes per diagram (6-10 is ideal)
- Maximum depth: 5-6 levels for vertical flowcharts (TB/TD)
- Maximum width: 3-4 parallel branches
- Balance proportions - avoid tall thin or wide flat diagrams
- If content exceeds limits, split into multiple diagrams
- Use subgraphs to fill spaces and improve balance

GOOD PROPORTIONS:
✓ 6-8 nodes in 3-4 levels (balanced)
✓ 2-3 parallel branches (readable)
✓ Mix of vertical and horizontal flow with subgraphs

BAD PROPORTIONS:
✗ 15+ nodes in single chain (too tall)
✗ 8 parallel branches (too wide)
✗ Single linear path with 10+ nodes (boring, inefficient)

═══════════════════════════════════════════════════════════════
SYNTAX RULES (MUST FOLLOW STRICTLY)
═══════════════════════════════════════════════════════════════
1. Always use proper spacing: A --> B (not A-->B)
2. Declare all nodes before defining links
3. Keep node text simple - no special characters
4. Each node ID must be unique and alphanumeric (A, B, C or Node1, Step2)
5. Always leave space between elements:
   ✓ CORRECT: A[Node] --> B[Next]
   ✗ WRONG: A[Node]B[Next]
6. Arrow labels must be simple text with NO quotes:
   ✓ CORRECT: A -->|Yes| B
   ✗ WRONG: A -->|"Yes"| B
7. Comments use %%: %% This is a comment
8. Word "end" must be capitalized: End or END (not end)
9. Starting with "o" or "x" - add space: A --- ops (not A---ops)
10. Use <br/> for line breaks, no other HTML tags

═══════════════════════════════════════════════════════════════
REQUIRED INITIALIZATION
═══════════════════════════════════════════════════════════════
EVERY diagram MUST start with this exact line:
%%{init: {'flowchart': {'nodeSpacing': 50, 'rankSpacing': 80, 'curve': 'basis'}}}%%

Then immediately follow with flowchart declaration

═══════════════════════════════════════════════════════════════
COMPLETE EXAMPLES - FOLLOW THESE PATTERNS
═══════════════════════════════════════════════════════════════

EXAMPLE 1 - Simple Process (All nodes declared first):
%%{init: {'flowchart': {'nodeSpacing': 50, 'rankSpacing': 80, 'curve': 'basis'}}}%%
flowchart TD
    Start((Start Process))
    B([Collect Data])
    C{Is Valid?}
    D([Process Data])
    E([Show Error])
    F((End))
    
    Start --> B
    B --> C
    C -->|Yes| D
    C -->|No| E
    D --> F
    E --> F

EXAMPLE 2 - Workflow with Subgraph:
%%{init: {'flowchart': {'nodeSpacing': 50, 'rankSpacing': 80, 'curve': 'basis'}}}%%
flowchart LR
    Start((Begin))
    Input([Enter Data])
    Process([Process])
    Save[(Save)]
    Done((Complete))
    
    Start --> Input
    Input --> Process
    
    subgraph Processing["Data Processing"]
        direction TB
        Process
        Validate([Validate])
        Transform([Transform])
        
        Process --> Validate
        Validate --> Transform
    end
    
    Transform --> Save
    Save --> Done

EXAMPLE 3 - Decision Tree:
%%{init: {'flowchart': {'nodeSpacing': 50, 'rankSpacing': 80, 'curve': 'basis'}}}%%
flowchart TD
    Start((Start))
    Check1{Check A?}
    Check2{Check B?}
    Action1([Do Action 1])
    Action2([Do Action 2])
    Action3([Do Action 3])
    End((End))
    
    Start --> Check1
    Check1 -->|Yes| Action1
    Check1 -->|No| Check2
    Check2 -->|Yes| Action2
    Check2 -->|No| Action3
    Action1 --> End
    Action2 --> End
    Action3 --> End

═══════════════════════════════════════════════════════════════
FINAL CHECKLIST BEFORE OUTPUT
═══════════════════════════════════════════════════════════════
✓ Init line at top of each diagram
✓ All nodes declared before links
✓ All node text is simple (no special characters)
✓ All link labels have NO quotes
✓ Proper spacing in all syntax
✓ Rounded shapes used primarily
✓ Diagram size is 6-12 nodes
✓ Balanced proportions (not too tall or wide)
✓ Delimiters used: ---DIAGRAM: [Title]---
✓ No markdown code blocks
✓ No explanatory text, only diagrams

NOW GENERATE THE DIAGRAMS:`
};